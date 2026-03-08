import type { MarketFeature, MarketFeatureCollection } from '../types/market';
import type { Feature } from 'geojson';
import { isSupabaseConfigured } from '../lib/supabase';
import { loadMarketsFromSupabase } from './marketsApi';

// Centralized loader so swapping data source is easy
const DATA_URL = '/data/Ferias_de_Chile.geojson';

/** Keep Point and LineString as-is; ensure properties.name exists. */
function toMarketFeature(f: Feature): MarketFeature | null {
  const geom = f.geometry;
  if (!geom) return null;
  if (geom.type === 'Point') {
    if (!Array.isArray(geom.coordinates) || geom.coordinates.length < 2) return null;
  } else if (geom.type === 'LineString') {
    if (!Array.isArray(geom.coordinates) || geom.coordinates.length < 2) return null;
  } else {
    return null;
  }
  const props = (f.properties ?? {}) as Record<string, unknown>;
  return {
    type: 'Feature',
    id: f.id,
    properties: { ...props, name: (props.name as string) ?? 'Feria sin nombre' },
    geometry: geom as MarketFeature['geometry']
  };
}

export async function loadMarketsFromFile(): Promise<MarketFeatureCollection> {
  const response = await fetch(DATA_URL);

  if (!response.ok) {
    throw new Error(`Failed to load markets GeoJSON (${response.status})`);
  }

  const data = (await response.json()) as unknown;

  if (
    !data ||
    typeof data !== 'object' ||
    (data as { type?: string }).type !== 'FeatureCollection'
  ) {
    throw new Error('Invalid GeoJSON: expected a FeatureCollection');
  }

  const raw = data as { type: string; features: Feature[] };
  const features = raw.features
    .map(toMarketFeature)
    .filter((f): f is MarketFeature => f != null);

  return { type: 'FeatureCollection', features };
}

/** Load from Supabase if configured, otherwise from static GeoJSON file. */
export async function loadMarkets(): Promise<MarketFeatureCollection> {
  if (isSupabaseConfigured()) {
    return loadMarketsFromSupabase();
  }
  return loadMarketsFromFile();
}