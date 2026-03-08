import type { MarketFeature } from '../types/market';

/** GeoJSON coordinates are [lng, lat]. Leaflet uses [lat, lng]. */

/** Single point for marker position / distance: first coordinate of the feature. */
export function getFeatureCenter(feature: MarketFeature): { lat: number; lng: number } {
  const g = feature.geometry;
  if (g.type === 'Point') {
    if (!Array.isArray(g.coordinates) || g.coordinates.length < 2) {
      throw new Error('Point geometry must have coordinates array with at least [lng, lat]');
    }
    const [lng, lat] = g.coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number' || !Number.isFinite(lng) || !Number.isFinite(lat)) {
      throw new Error('Point coordinates must be finite numbers [lng, lat]');
    }
    return { lat, lng };
  }
  if (!Array.isArray(g.coordinates) || g.coordinates.length === 0) {
    throw new Error('LineString must have at least one coordinate');
  }
  const first = g.coordinates[0];
  if (!Array.isArray(first) || first.length < 2) {
    throw new Error('LineString must have at least one coordinate with [lng, lat]');
  }
  const [lng, lat] = first;
  if (typeof lng !== 'number' || typeof lat !== 'number' || !Number.isFinite(lng) || !Number.isFinite(lat)) {
    throw new Error('LineString first coordinate must be finite numbers [lng, lat]');
  }
  return { lat, lng };
}

/** All positions as [lat, lng] for Polyline or single point. */
export function getFeaturePositions(feature: MarketFeature): [number, number][] {
  const g = feature.geometry;
  if (g.type === 'Point') {
    if (!Array.isArray(g.coordinates) || g.coordinates.length < 2) {
      throw new Error('Point geometry must have coordinates array with at least [lng, lat]');
    }
    const [lng, lat] = g.coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number' || !Number.isFinite(lng) || !Number.isFinite(lat)) {
      throw new Error('Point coordinates must be finite numbers [lng, lat]');
    }
    return [[lat, lng]];
  }
  if (!Array.isArray(g.coordinates)) {
    throw new Error('LineString coordinates must be an array');
  }
  return g.coordinates
    .filter((c): c is [number, number] => Array.isArray(c) && c.length >= 2 && c.every((n) => typeof n === 'number' && Number.isFinite(n)))
    .map(([lng, lat]) => [lat, lng]);
}

/** All points for bounds calculation: [lat, lng][] */
export function getAllPointsForBounds(feature: MarketFeature): [number, number][] {
  return getFeaturePositions(feature);
}

/** Map viewport bounds (Leaflet getBounds() shape). */
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** True if the feature has any vertex inside the given bounds. */
export function featureIntersectsBounds(feature: MarketFeature, b: MapBounds): boolean {
  const points = getFeaturePositions(feature); // [lat, lng][]
  return points.some(([lat, lng]) => lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east);
}
