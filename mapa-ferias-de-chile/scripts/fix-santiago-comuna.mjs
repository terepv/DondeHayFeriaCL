#!/usr/bin/env node
/**
 * Fix features that have "Provincia de Santiago" as comuna (that's a province, not a comuna).
 * Re-geocodes only those with zoom=14 and uses city/municipality/town/village, never county.
 *
 * Run from project root: node scripts/fix-santiago-comuna.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GEOJSON_PATH = join(__dirname, '..', 'public', 'data', 'Ferias_de_Chile.geojson');
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
const DELAY_MS = 1100;
const BAD_COMUNA = 'Provincia de Santiago';

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

/** Prefer city/municipality/town/village; never use county (province). */
async function reverseGeocodeComuna(lat, lon) {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('lat', lat);
  url.searchParams.set('lon', lon);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('zoom', '14'); // neighbourhood/city level

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'FeriasChileMap/1.0 (fix Santiago comuna)' }
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}: ${res.statusText}`);
  const data = await res.json();
  const addr = data.address || {};
  const comuna =
    addr.city ||
    addr.municipality ||
    addr.town ||
    addr.village ||
    addr.suburb ||
    addr.neighbourhood ||
    null;
  return comuna;
}

async function main() {
  const geojson = JSON.parse(readFileSync(GEOJSON_PATH, 'utf8'));
  const features = geojson.features || [];
  const toFix = features.filter(
    (f) => (f.properties?.comuna || '').trim() === BAD_COMUNA
  );
  console.log(`Found ${toFix.length} features with comuna "${BAD_COMUNA}" to fix.`);

  for (let i = 0; i < toFix.length; i++) {
    const f = toFix[i];
    const name = f.properties?.name ?? f.id ?? i + 1;
    const center = getCenter(f);
    if (!center) {
      console.warn(`  [${i + 1}/${toFix.length}] ${name}: no coordinates, skip`);
      continue;
    }

    try {
      const comuna = await reverseGeocodeComuna(center.lat, center.lon);
      const newComuna = comuna && comuna !== BAD_COMUNA ? comuna : 'Santiago';
      f.properties.comuna = newComuna;
      console.log(`  [${i + 1}/${toFix.length}] ${name} → ${newComuna}`);
    } catch (err) {
      f.properties.comuna = 'Santiago';
      console.warn(`  [${i + 1}/${toFix.length}] ${name}: ${err.message}, set to Santiago`);
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
