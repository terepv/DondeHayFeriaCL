import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Polyline,
  useMap
} from 'react-leaflet';
import type { MarketFeature } from '../types/market';
import type { LatLng } from '../utils/distance';
import { getFeatureCenter, getFeaturePositions, getAllPointsForBounds } from '../utils/geometry';
import { getMarketMarkerIcon } from '../utils/leafletIcons';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet-textpath';
import { useTheme } from '../context/ThemeContext';
import { MarketPopupContent } from './MarketPopupContent';

const LIGHT_TILES = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

const DARK_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
};

interface MapViewProps {
  markets: MarketFeature[];
  getFeatureId: (feature: MarketFeature, index: number) => string;
  selectedMarket: MarketFeature | null;
  onSelectMarket: (feature: MarketFeature, index: number) => void;
  userLocation: LatLng | null;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

const DEFAULT_CENTER: [number, number] = [-35.675147, -71.542969];
const DEFAULT_ZOOM = 5;

const MapAutoFit: React.FC<{ markets: MarketFeature[] }> = ({ markets }) => {
  const map = useMap();

  useEffect(() => {
    if (!markets.length) return;

    const allPoints = markets.flatMap((f) => getAllPointsForBounds(f));
    const bounds = L.latLngBounds(allPoints);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, markets]);

  return null;
};

const USER_LOCATION_ZOOM = 14;

const FlyToUserLocation: React.FC<{ userLocation: LatLng | null }> = ({ userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!userLocation) return;
    map.flyTo([userLocation.lat, userLocation.lng], USER_LOCATION_ZOOM, { duration: 0.6 });
  }, [map, userLocation]);

  return null;
};

const MapBoundsReporter: React.FC<{
  onBoundsChange: (b: { north: number; south: number; east: number; west: number }) => void;
}> = ({ onBoundsChange }) => {
  const map = useMap();
  useEffect(() => {
    const update = () => {
      const b = map.getBounds();
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest()
      });
    };
    update();
    map.on('moveend', update);
    map.on('zoomend', update);
    return () => {
      map.off('moveend', update);
      map.off('zoomend', update);
    };
  }, [map, onBoundsChange]);
  return null;
};

/** Polyline extended by leaflet-textpath plugin (setText). */
interface PolylineWithTextPath extends L.Polyline {
  setText?(text: string | null, options?: object): void;
}

/** Polyline that shows "Días" text along the path (via leaflet-textpath). */
const PolylineWithText: React.FC<{
  positions: [number, number][];
  pathOptions: L.PathOptions;
  eventHandlers?: { click?: () => void };
  days?: string;
  isDark: boolean;
  children: React.ReactNode;
}> = ({ positions, pathOptions, eventHandlers, days, isDark, children }) => {
  const layerRef = React.useRef<PolylineWithTextPath | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const layer = layerRef.current;
    if (!layer || !days?.trim()) return;
    const map = (layer as unknown as { _map?: L.Map })._map;
    const orientation =
      map && positions.length >= 2
        ? (() => {
            const first = map.latLngToContainerPoint(L.latLng(positions[0][0], positions[0][1]));
            const last = map.latLngToContainerPoint(
              L.latLng(positions[positions.length - 1][0], positions[positions.length - 1][1])
            );
            const dx = last.x - first.x;
            const dy = last.y - first.y;
            const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
            /* Text on path is right-side up when path runs roughly left-to-right; flip when it would read upside-down (path toward upper-left or similar). */
            if (angleDeg > 90 && angleDeg < 270) return 'flip' as const;
            return undefined;
          })()
        : undefined;
    /* Plugin uses (offset || stroke-width); 0 is falsy so we use a tiny value to get dy≈0 and center via dominant-baseline */
    const options: {
      repeat: boolean;
      center: boolean;
      offset: number;
      orientation?: 'flip';
      attributes: Record<string, string>;
    } = {
      repeat: false,
      center: true,
      offset: 0.001,
      attributes: {
        /* High contrast vs polyline (green): white fill + dark outline for readability on the line and map */
        fill: '#ffffff',
        stroke: '#0f172a',
        'stroke-width': '1.5',
        'paint-order': 'stroke fill',
        'font-weight': 'bold',
        'font-size': '13px',
        'font-family': '"Atkinson Hyperlegible", sans-serif',
        'dominant-baseline': 'middle'
      }
    };
    if (orientation) options.orientation = orientation;
    layer.setText?.(days.trim(), options);
    return () => {
      layer.setText?.(null);
    };
  }, [days, isDark, ready, positions]);

  return (
    <Polyline
      ref={(r) => {
        layerRef.current = (r ?? null) as PolylineWithTextPath | null;
        if (r) setReady(true);
      }}
      positions={positions}
      pathOptions={pathOptions}
      eventHandlers={eventHandlers}
    >
      {children}
    </Polyline>
  );
};

const FlyToSelected: React.FC<{ selectedMarket: MarketFeature | null }> = ({ selectedMarket }) => {
  const map = useMap();
  const popupRef = useRef<L.Popup | null>(null);
  const popupRootRef = useRef<ReturnType<typeof createRoot> | null>(null);

  useEffect(() => {
    if (popupRef.current) {
      map.removeLayer(popupRef.current);
      popupRef.current = null;
    }
    if (popupRootRef.current) {
      popupRootRef.current.unmount();
      popupRootRef.current = null;
    }
    if (!selectedMarket) return;

    const center = getFeatureCenter(selectedMarket);
    const isLine = selectedMarket.geometry.type === 'LineString';
    const positions = getFeaturePositions(selectedMarket);

    if (isLine && positions.length >= 2) {
      const bounds = L.latLngBounds(positions);
      map.flyToBounds(bounds, { padding: [60, 60], duration: 0.5 });
    } else {
      map.flyTo([center.lat, center.lng], 15, { duration: 0.5 });
    }

    const container = document.createElement('div');
    const root = createRoot(container);
    root.render(<MarketPopupContent feature={selectedMarket} />);
    popupRootRef.current = root;

    const popup = L.popup({ className: 'selected-feature-popup' })
      .setLatLng([center.lat, center.lng])
      .setContent(container);
    popupRef.current = popup;
    popup.openOn(map);

    return () => {
      if (popupRootRef.current) {
        popupRootRef.current.unmount();
        popupRootRef.current = null;
      }
      if (popupRef.current) {
        map.removeLayer(popupRef.current);
        popupRef.current = null;
      }
    };
  }, [map, selectedMarket]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  markets,
  getFeatureId,
  selectedMarket,
  onSelectMarket,
  userLocation,
  onBoundsChange
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const tiles = isDark ? DARK_TILES : LIGHT_TILES;

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      attributionControl={false}
      className="w-full h-full"
      aria-label="Mapa de ferias"
      aria-describedby="map-description"
    >
      <TileLayer attribution={tiles.attribution} url={tiles.url} />

      {markets.length > 0 && <MapAutoFit markets={markets} />}
      {onBoundsChange && <MapBoundsReporter onBoundsChange={onBoundsChange} />}
      <FlyToUserLocation userLocation={userLocation} />
      <FlyToSelected selectedMarket={selectedMarket} />

      {/* Draw LineStrings as polylines (below markers); click line to see popup */}
      {markets.map((feature, index) => {
        if (feature.geometry.type !== 'LineString') return null;
        const positions = getFeaturePositions(feature);
        if (positions.length < 2) return null;
        const id = getFeatureId(feature, index);
        const days = (feature.properties?.days as string | undefined) ?? (feature.properties?.Días as string | undefined);
        return (
          <PolylineWithText
            key={`line-${id}`}
            positions={positions}
            pathOptions={{
              color: isDark ? '#34d399' : '#047857',
              weight: 10,
              opacity: isDark ? 0.95 : 0.8
            }}
            eventHandlers={{
              click: () => onSelectMarket(feature, index)
            }}
            days={days}
            isDark={isDark}
          >
            <Popup>
              <MarketPopupContent feature={feature} />
            </Popup>
          </PolylineWithText>
        );
      })}

      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={L.divIcon({
            className: 'flex items-center justify-center',
            html: `<span style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:${isDark ? '#3b82f0' : '#2563eb'};color:#fff;font-size:12px;font-weight:600;font-family:\"Atkinson Hyperlegible\",sans-serif;border:2px solid ${isDark ? '#e2e8f0' : '#fff'};box-shadow:0 2px 8px rgba(0,0,0,0.2);">Tú</span>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          })}
        >
          <Tooltip permanent={false} direction="top" offset={[0, -24]}>
            Estás aquí (ubicación aproximada)
          </Tooltip>
        </Marker>
      )}

      <MarkerClusterGroup
        chunkedLoading
        showCoverageOnHover={false}
        spiderfyOnEveryZoom={false}
        maxClusterRadius={150}
        zoomToBoundsOnClick
      >
        {markets.map((feature, index) => {
          const center = getFeatureCenter(feature);
          const id = getFeatureId(feature, index);
          return (
            <Marker
              key={id}
              position={[center.lat, center.lng]}
              icon={getMarketMarkerIcon()}
              eventHandlers={{
                click: () => onSelectMarket(feature, index)
              }}
            >
              <Popup>
                <MarketPopupContent feature={feature} />
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

