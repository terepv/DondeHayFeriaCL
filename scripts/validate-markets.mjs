/** Validate the single canonical market dataset without generating files. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const dataDirectory = new URL('../public/data/', import.meta.url);
const filename = 'Ferias_de_Chile.geojson';
const geojsonFiles = readdirSync(dataDirectory, { recursive: true })
  .filter((name) => name.toLowerCase().endsWith('.geojson'));
assert.deepEqual(geojsonFiles, [filename], 'Keep only the canonical GeoJSON in public/data');

const data = JSON.parse(readFileSync(new URL(filename, dataDirectory), 'utf8'));
assert.equal(data.type, 'FeatureCollection');
assert.ok(Array.isArray(data.features) && data.features.length > 0, 'Expected market features');

const ids = new Set();
const counts = { Point: 0, LineString: 0 };
for (const [index, feature] of data.features.entries()) {
  const context = `Feature ${index} (${feature.id ?? 'missing ID'})`;
  assert.equal(feature.type, 'Feature', context);
  assert.ok(typeof feature.id === 'string' && feature.id.trim(), `${context}: missing ID`);
  assert.ok(!ids.has(feature.id), `${context}: duplicate ID`);
  ids.add(feature.id);
  for (const key of ['name', 'region', 'comuna', 'Días', 'Horario']) {
    assert.equal(typeof feature.properties?.[key], 'string', `${context}: invalid ${key}`);
  }
  assert.ok(feature.properties.name.trim(), `${context}: empty market name`);
  const geometry = feature.geometry;
  assert.ok(geometry && Object.hasOwn(counts, geometry.type), `${context}: unsupported geometry`);
  const coordinates = geometry.type === 'Point' ? [geometry.coordinates] : geometry.coordinates;
  assert.ok(Array.isArray(coordinates), `${context}: missing coordinates`);
  assert.ok(coordinates.length >= (geometry.type === 'Point' ? 1 : 2), `${context}: incomplete geometry`);
  for (const coordinate of coordinates) {
    assert.ok(Array.isArray(coordinate) && coordinate.length === 2, `${context}: expected [longitude, latitude]`);
    const [longitude, latitude] = coordinate;
    assert.ok(Number.isFinite(longitude) && longitude >= -180 && longitude <= 180, `${context}: invalid longitude`);
    assert.ok(Number.isFinite(latitude) && latitude >= -90 && latitude <= 90, `${context}: invalid latitude`);
  }
  counts[geometry.type]++;
}

console.log(`Validated ${ids.size} locations: ${counts.LineString} street routes and ${counts.Point} reference points.`);
