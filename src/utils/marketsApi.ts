import type { MarketFeature, MarketFeatureCollection } from '../types/market';
import type { Point, LineString } from 'geojson';
import { supabase } from '../lib/supabase';

const TABLE = 'markets';

export interface MarketRow {
  id: string;
  geometry: { type: 'Point' | 'LineString'; coordinates: number[] | number[][] };
  properties: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

function rowToFeature(row: MarketRow): MarketFeature {
  const geom = row.geometry;
  if (geom.type !== 'Point' && geom.type !== 'LineString') {
    throw new Error(`Unsupported geometry type: ${(geom as { type: string }).type}`);
  }
  return {
    type: 'Feature',
    id: row.id,
    geometry: geom as Point | LineString,
    properties: {
      ...row.properties,
      name: (row.properties?.name as string) ?? 'Feria sin nombre'
    }
  };
}

export async function loadMarketsFromSupabase(): Promise<MarketFeatureCollection> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, geometry, properties')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  const features = (data ?? []).map((row) => rowToFeature(row as MarketRow));
  return { type: 'FeatureCollection', features };
}
