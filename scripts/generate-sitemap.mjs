#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from Ferias_de_Chile.geojson (city slugs)
 * plus static URLs (home, attribuciones, ferias index).
 *
 * Run from project root: node scripts/generate-sitemap.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { slugify } from './slugify.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GEOJSON_PATH = join(__dirname, '..', 'public', 'data', 'Ferias_de_Chile.geojson');
const SITEMAP_PATH = join(__dirname, '..', 'public', 'sitemap.xml');
const BASE_URL = 'https://dondehayferia.cl';

const today = new Date().toISOString().slice(0, 10);

function main() {
  const raw = readFileSync(GEOJSON_PATH, 'utf8');
  const geojson = JSON.parse(raw);
  const features = geojson.features || [];

  const comunas = new Set();
  for (const f of features) {
    const p = f.properties || {};
    const comuna = (p.comuna ?? p.commune) ?? '';
    if (typeof comuna === 'string' && comuna.trim()) comunas.add(comuna.trim());
  }
  const slugs = Array.from(comunas)
    .sort((a, b) => a.localeCompare(b, 'es'))
    .map((c) => slugify(c))
    .filter(Boolean);

  const urls = [
    { loc: BASE_URL + '/', priority: '1.0', changefreq: 'weekly' },
    { loc: BASE_URL + '/ferias/', priority: '0.9', changefreq: 'weekly' },
    { loc: BASE_URL + '/attribuciones.html', priority: '0.5', changefreq: 'monthly' },
    ...slugs.map((slug) => ({
      loc: `${BASE_URL}/ferias-en-${slug}/`,
      priority: '0.8',
      changefreq: 'weekly'
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  writeFileSync(SITEMAP_PATH, xml, 'utf8');
  console.log(`Sitemap written to public/sitemap.xml (${urls.length} URLs).`);
}

main();
