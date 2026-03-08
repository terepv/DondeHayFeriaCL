#!/usr/bin/env node
/**
 * Enriches Ferias_de_Chile.geojson with Región and Comuna from coordinates
 * using Nominatim reverse geocoding (1 req/sec).
 *
 * Run from project root: node scripts/enrich-geojson.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GEOJSON_PATH = join(__dirname, '..', 'public', 'data', 'Ferias_de_Chile.geojson');
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
const DELAY_MS = 1100; // Nominatim usage policy: max 1 request per second

function getCenter(feature) {
  const g = feature.geometry;
  if (!g || !g.coordinates) return null;
  if (g.type === 'Point') return { lat: g.coordinates[1], lon: g.coordinates[0] };
  if (g.type === 'LineString') {
    const c = g.coordinates[0];
    return { lat: c[1], lon: c[0] };
  }
  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function reverseGeocode(lat, lon) {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('lat', lat);
  url.searchParams.set('lon', lon);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'FeriasChileMap/1.0 (local enrichment script)' }
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}: ${res.statusText}`);
  const data = await res.json();
  const addr = data.address || {};
  const region = addr.state || addr.region || null;
  const comuna =
    addr.city ||
    addr.municipality ||
    addr.town ||
    addr.county ||
    addr.village ||
    null;
  return { region, comuna };
}

async function main() {
  const geojson = JSON.parse(readFileSync(GEOJSON_PATH, 'utf8'));
  const features = geojson.features || [];
  console.log(`Enriching ${features.length} features with Región and Comuna...`);

  for (let i = 0; i < features.length; i++) {
    const f = features[i];
    const name = f.properties?.name ?? f.id ?? i + 1;
    const center = getCenter(f);
    if (!center) {
      console.warn(`  [${i + 1}/${features.length}] ${name}: no coordinates, skip`);
      continue;
    }

    try {
      const { region, comuna } = await reverseGeocode(center.lat, center.lon);
      f.properties = f.properties || {};
      if (region) f.properties.region = region;
      if (comuna) f.properties.comuna = comuna;
      console.log(`  [${i + 1}/${features.length}] ${name} → ${region ?? '-'}, ${comuna ?? '-'}`);
    } catch (err) {
      console.warn(`  [${i + 1}/${features.length}] ${name}: ${err.message}`);
    }

    await sleep(DELAY_MS);
  }

  writeFileSync(GEOJSON_PATH, JSON.stringify(geojson, null, 0), 'utf8');
  console.log(`\nWrote ${GEOJSON_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
