import type { Feature, FeatureCollection, Point, LineString } from 'geojson';

export interface MarketProperties {
  id?: string | number;
  name: string;
  comuna?: string;
  commune?: string;
  region?: string;
  days?: string;
  address?: string;
  /** Chilean dataset uses "Días" and "Horario" */
  Días?: string;
  Horario?: string;
  [key: string]: unknown;
}

export type MarketFeature = Feature<Point | LineString, MarketProperties>;
export type MarketFeatureCollection = FeatureCollection<Point | LineString, MarketProperties>;