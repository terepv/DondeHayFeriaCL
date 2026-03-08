import React, { useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { loadMarkets } from './utils/geojsonLoader';
import type { MarketFeature } from './types/market';
import { distanceInKm, type LatLng } from './utils/distance';
import { getFeatureCenter, featureIntersectsBounds, type MapBounds } from './utils/geometry';
import {
  getFeatureId,
  getRegion,
  getCommune,
  getName,
  getDays,
  getHorario,
  getAddress,
  DIAS_SEMANA,
  marketOpensOnDay
} from './utils/marketUtils';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FiltersBar } from './components/FiltersBar';
import { MapView } from './components/MapView';
import { MarketList } from './components/MarketList';

export const App: React.FC = () => {
  const [markets, setMarkets] = useState<MarketFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);

  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCommune, setSelectedCommune] = useState<string>('all');
  const [selectedDias, setSelectedDias] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const collection = await loadMarkets();
        if (cancelled) return;

        const valid = collection.features.filter((f) => {
          if (!f.geometry) return false;
          if (f.geometry.type === 'Point')
            return Array.isArray(f.geometry.coordinates) && f.geometry.coordinates.length >= 2;
          if (f.geometry.type === 'LineString')
            return Array.isArray(f.geometry.coordinates) && f.geometry.coordinates.length >= 2;
          return false;
        }) as MarketFeature[];

        setMarkets(valid);
        setLoadError(null);
      } catch (err) {
        console.error(err);
        setLoadError(
          err instanceof Error ? err.message : 'Error desconocido al cargar las ferias'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const regions = useMemo(() => {
    const set = new Set<string>();
    markets.forEach((m) => {
      const region = getRegion(m);
      if (region) set.add(region);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [markets]);

  const communes = useMemo(() => {
    const set = new Set<string>();
    markets.forEach((m) => {
      const region = getRegion(m);
      const commune = getCommune(m);
      if (!commune) return;
      if (selectedRegion !== 'all' && region && region !== selectedRegion) {
        return;
      }
      set.add(commune);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [markets, selectedRegion]);

  const filteredMarkets = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const hasSearch = term.length > 0;

    return markets.filter((feature) => {
      const region = getRegion(feature);
      const commune = getCommune(feature);
      const name = getName(feature);
      const days = getDays(feature);
      const horario = getHorario(feature);
      const address = getAddress(feature);

      if (selectedRegion !== 'all' && region !== selectedRegion) {
        return false;
      }

      if (selectedCommune !== 'all' && commune !== selectedCommune) {
        return false;
      }

      if (selectedDias.length > 0) {
        const opensOnAnySelected = selectedDias.some((day) => marketOpensOnDay(days, day));
        if (!opensOnAnySelected) return false;
      }

      if (hasSearch) {
        const haystack = [name, commune, region, days, horario, address]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [markets, selectedRegion, selectedCommune, selectedDias, searchTerm]);

  const marketsWithDistance = useMemo(() => {
    if (!userLocation) return filteredMarkets;

    return [...filteredMarkets].sort((a, b) => {
      const centerA = getFeatureCenter(a);
      const centerB = getFeatureCenter(b);
      const dA = distanceInKm(userLocation, centerA);
      const dB = distanceInKm(userLocation, centerB);
      return dA - dB;
    });
  }, [filteredMarkets, userLocation]);

  const visibleInMapMarkets = useMemo(() => {
    if (!mapBounds) return marketsWithDistance;
    return marketsWithDistance.filter((f) => featureIntersectsBounds(f, mapBounds));
  }, [marketsWithDistance, mapBounds]);

  const selectedMarket =
    selectedMarketId != null
      ? markets.find((m, index) => getFeatureId(m, index) === selectedMarketId) ??
        null
      : null;

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError('La geolocalización no está soportada en este navegador.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        if (err.code !== 1) {
          setGeoError(
            err.message || 'No se pudo obtener tu ubicación. Inténtalo de nuevo.'
          );
        }
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSelectMarket = (feature: MarketFeature, index: number) => {
    setSelectedMarketId(getFeatureId(feature, index));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EDE7D6] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <Header />

      <main
        id="main-content"
        className="flex-1 flex flex-col gap-4 pt-2 md:pt-3 px-4 md:px-6 pb-4 md:pb-6"
        aria-label="Mapa y lista de ferias"
      >
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div
              className="rounded-lg bg-white shadow px-6 py-4 text-center dark:bg-slate-800 dark:text-slate-200"
              role="status"
              aria-live="polite"
            >
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Cargando ferias…
              </p>
              <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
                Obteniendo datos. Puede tardar unos segundos.
              </p>
            </div>
          </div>
        ) : loadError ? (
          <div className="flex-1 flex items-center justify-center">
            <div
              className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-6 py-4 max-w-xl dark:bg-red-950/50 dark:border-red-800 dark:text-red-200"
              role="alert"
            >
              <p className="text-lg font-semibold">No se pudieron cargar los datos de ferias.</p>
              <p className="mt-1 text-base">{loadError}</p>
              <p className="mt-2 text-base text-red-700 dark:text-red-300">
                Comprueba que el archivo GeoJSON exista en{' '}
                <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">
                  public/data/Ferias_de_Chile.geojson
                </code>{' '}
                y que sea un GeoJSON válido.
              </p>
            </div>
          </div>
        ) : (
          <>
            <FiltersBar
              regions={regions}
              communes={communes}
              diasSemana={DIAS_SEMANA}
              selectedRegion={selectedRegion}
              selectedCommune={selectedCommune}
              selectedDias={selectedDias}
              onRegionChange={setSelectedRegion}
              onCommuneChange={setSelectedCommune}
              onDiasChange={setSelectedDias}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              geoError={geoError}
            />

            <section
              aria-label="Resultados del filtro"
              className="flex items-center justify-between gap-2"
            >
              <p
                className="text-sm text-slate-600 dark:text-slate-400"
                aria-live="polite"
              >
                <span className="font-semibold">{marketsWithDistance.length}</span>{' '}
                feria{marketsWithDistance.length === 1 ? '' : 's'} que coinciden con los filtros
              </p>
            </section>

            <p id="map-description" className="sr-only">
              El mapa muestra cada feria. Para navegar con teclado, usa la lista
              de ferias, que es totalmente accesible.
            </p>

            <section
              aria-label="Ubicación en el mapa"
              className="flex md:hidden flex-wrap items-center justify-end gap-x-2 gap-y-2"
            >
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                className={clsx(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  isLocating
                    ? 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                    : 'bg-[#60867D] text-white border-[#60867D] hover:bg-[#4d6b63] hover:border-[#4d6b63] focus-visible:ring-[#60867D] dark:bg-[#60867D] dark:border-[#60867D] dark:hover:bg-[#4d6b63] dark:hover:border-[#4d6b63]'
                )}
              >
                {isLocating ? (
                  <>
                    <span aria-hidden className="animate-pulse h-1.5 w-1.5 rounded-full bg-slate-500" />
                    Buscando…
                  </>
                ) : (
                  <>
                    <span aria-hidden>📍</span>
                    Usar mi ubicación
                  </>
                )}
              </button>
            </section>

            <section className="flex-1 flex flex-col md:flex-row gap-4 min-h-[60vh]">
              <div className="hidden md:flex flex-none w-max max-w-sm min-h-0 rounded-lg overflow-visible shadow bg-white dark:bg-slate-800 order-first">
                <MarketList
                  markets={visibleInMapMarkets}
                  getFeatureId={getFeatureId}
                  getGlobalIndex={(f) => marketsWithDistance.indexOf(f)}
                  userLocation={userLocation}
                  onSelectMarket={handleSelectMarket}
                  onLocateMe={handleLocateMe}
                  isLocating={isLocating}
                  hasUserLocation={Boolean(userLocation)}
                />
              </div>
              <div
                className="relative flex-1 min-h-[60vh] md:min-h-0 rounded-lg overflow-hidden shadow bg-white dark:bg-slate-800 order-last"
                aria-label="Vista del mapa"
              >
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <MapView
                  markets={marketsWithDistance}
                  getFeatureId={getFeatureId}
                  selectedMarket={selectedMarket}
                  onSelectMarket={handleSelectMarket}
                  userLocation={userLocation}
                  onBoundsChange={setMapBounds}
                />
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
