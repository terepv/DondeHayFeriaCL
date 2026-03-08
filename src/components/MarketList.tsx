import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import type { MarketFeature } from '../types/market';
import type { LatLng } from '../utils/distance';
import { distanceInKm } from '../utils/distance';
import { getFeatureCenter } from '../utils/geometry';
import { getName, getRegion, getCommune, getDays, getHorario, getAddress } from '../utils/marketUtils';

const PAGE_SIZE = 6;

interface MarketListProps {
  markets: MarketFeature[];
  getFeatureId: (feature: MarketFeature, index: number) => string;
  getGlobalIndex?: (feature: MarketFeature) => number;
  userLocation: LatLng | null;
  onSelectMarket: (feature: MarketFeature, index: number) => void;
  onLocateMe: () => void;
  isLocating: boolean;
  hasUserLocation: boolean;
}

export const MarketList: React.FC<MarketListProps> = ({
  markets,
  getFeatureId,
  getGlobalIndex,
  userLocation,
  onSelectMarket,
  onLocateMe,
  isLocating,
  hasUserLocation
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(markets.length / PAGE_SIZE));
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageMarkets = markets.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [markets.length]);

  return (
    <div
      className="h-full flex flex-col min-h-0"
      role="region"
      aria-label="Lista de ferias"
    >
      <header className="shrink-0 border-b border-slate-100 dark:border-slate-700 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Ferias en el mapa
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <span className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={onLocateMe}
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
            <span
              className="relative inline-flex group"
              onClick={(e) => e.preventDefault()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <span
                className="inline-flex items-center justify-center w-3 h-3 rounded-full border border-slate-400 dark:border-slate-500 text-slate-500 dark:text-slate-400 text-[8px] font-semibold cursor-help select-none"
                aria-label="Información sobre geolocalización"
              >
                i
              </span>
              <span
                role="tooltip"
                className="absolute bottom-full right-0 mb-1 px-2 py-1 rounded bg-slate-800 dark:bg-slate-700 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow"
              >
                Puedes explorar el mapa sin activarla.
              </span>
            </span>
          </span>
          </div>
        </div>
        <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
          {markets.length === 0
            ? 'No hay ferias en esta zona. Mueve o acerca el mapa para ver más.'
            : `${markets.length} feria${markets.length === 1 ? '' : 's'} ${markets.length === 1 ? 'visible' : 'visibles'}. Usa la lista o haz clic en el mapa.`}
        </p>
      </header>
      <ul className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
        {pageMarkets.map((feature, index) => {
          const globalIndex = getGlobalIndex ? getGlobalIndex(feature) : start + index;
          const id = getFeatureId(feature, globalIndex);
          const name = getName(feature);
          const region = getRegion(feature);
          const comuna = getCommune(feature);
          const days = getDays(feature);
          const horario = getHorario(feature);
          const address = getAddress(feature);
          const center = getFeatureCenter(feature);
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;

          let distanceLabel: string | null = null;
          if (userLocation) {
            const d = distanceInKm(userLocation, center);
            distanceLabel = `a ${d.toFixed(1)} km`;
          }

          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelectMarket(feature, globalIndex)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
              >
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex flex-wrap items-center gap-x-2 gap-y-0">
                  <span>{name}</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" aria-hidden="true" />
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-medium text-primary hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    Cómo llego?
                  </a>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  {comuna && <span>{comuna}</span>}
                  {comuna && region && <span> · </span>}
                  {region && <span>{region}</span>}
                </p>
                {address && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{address}</p>
                )}
                {days && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    <span className="font-medium">Días:</span> {days}
                  </p>
                )}
                {horario && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    <span className="font-medium">Horario:</span> {horario}
                  </p>
                )}
                {distanceLabel && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    {distanceLabel}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {markets.length > PAGE_SIZE && (
        <nav className="shrink-0 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-700 px-4 py-2 text-sm" aria-label="Paginación de la lista">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="inline-flex items-center gap-1 rounded px-2 py-1 font-medium text-primary-dark hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 disabled:cursor-not-allowed disabled:text-slate-500 disabled:hover:bg-transparent dark:text-emerald-400 dark:hover:bg-slate-700 dark:disabled:text-slate-400 dark:disabled:hover:bg-transparent"
              aria-label="Página anterior"
            >
              <span aria-hidden>&#8249;</span>
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="inline-flex items-center gap-1 rounded px-2 py-1 font-medium text-primary-dark hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 disabled:cursor-not-allowed disabled:text-slate-500 disabled:hover:bg-transparent dark:text-emerald-400 dark:hover:bg-slate-700 dark:disabled:text-slate-400 dark:disabled:hover:bg-transparent"
              aria-label="Página siguiente"
            >
              Siguiente
              <span aria-hidden>&#8250;</span>
            </button>
          </div>
          <span className="text-slate-600 dark:text-slate-400">
            Página {currentPage} de {totalPages} · {PAGE_SIZE} por página
          </span>
        </nav>
      )}
    </div>
  );
};

