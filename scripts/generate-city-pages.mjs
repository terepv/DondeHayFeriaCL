#!/usr/bin/env node
/**
 * Generates static HTML city pages from Ferias_de_Chile.geojson.
 * One page per comuna with natural-language list of ferias and SEO meta.
 * Output: public/ferias-en-<slug>/index.html
 *
 * Run from project root: node scripts/generate-city-pages.mjs
 */

import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { slugify } from './slugify.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GEOJSON_PATH = join(__dirname, '..', 'public', 'data', 'Ferias_de_Chile.geojson');
const PUBLIC_DIR = join(__dirname, '..', 'public');
const BASE_URL = 'https://dondehayferia.cl';
const GA_MEASUREMENT_ID = 'G-4RK7CPRL2Z';

function escapeHtml(s) {
  if (s == null) return '';
  const str = String(s);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getCommune(feature) {
  const p = feature.properties || {};
  const v = (p.comuna ?? p.commune) ?? '';
  return typeof v === 'string' ? v.trim() : '';
}

function getName(feature) {
  const p = feature.properties || {};
  return (p.name && String(p.name).trim()) || 'Feria sin nombre';
}

function getDias(feature) {
  const p = feature.properties || {};
  return (p.Días ?? p.days ?? '').trim();
}

function getHorario(feature) {
  const p = feature.properties || {};
  return (p.Horario ?? '').trim();
}

function buildCityPage(comuna, slug, ferias) {
  const title = `Ferias en ${comuna} – Dónde y cuándo | DóndeHayFeria`;
  const description = `Lista de ${ferias.length} feria${ferias.length === 1 ? '' : 's'} libre${ferias.length === 1 ? '' : 's'} en ${comuna} con días y horarios. Ver mapa interactivo.`;
  const url = `${BASE_URL}/ferias-en-${slug}/`;
  const ogImage = `${BASE_URL}/og-default.png`;

  // Natural language list: "Feria X: Días, Horario; Feria Y: ..."
  const listItems = ferias.map((f) => {
    const name = getName(f);
    const dias = getDias(f);
    const horario = getHorario(f);
    const part = horario ? `${dias}, ${horario}` : dias;
    return `${name}: ${part}`;
  });
  const listText = listItems.join('; ');
  const listHtml = ferias
    .map((f) => {
      const name = escapeHtml(getName(f));
      const dias = escapeHtml(getDias(f));
      const horario = escapeHtml(getHorario(f));
      const part = horario ? `${dias}, ${horario}` : dias;
      return `<li><strong>${name}</strong>: ${part}</li>`;
    })
    .join('\n    ');

  // JSON-LD ItemList for this page
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Ferias libres en ${comuna}`,
    description: description,
    numberOfItems: ferias.length,
    itemListElement: ferias.map((f, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: getName(f),
      description: `Días: ${getDias(f)}. Horario: ${getHorario(f)}.`
    }))
  };

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="canonical" href="${url}" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />

    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:locale" content="es_CL" />
    <meta property="og:site_name" content="DóndeHayFeria" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage}" />

    <script type="application/ld+json">${JSON.stringify(itemList)}</script>

    <!-- Google Analytics (GA4) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}');
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet" />
    <style>
      * { box-sizing: border-box; }
      body { font-family: 'Atkinson Hyperlegible', sans-serif; margin: 0; padding: 1rem 1.5rem; max-width: 48rem; margin-left: auto; margin-right: auto; line-height: 1.5; color: #1e293b; background: #EDE7D6; }
      a { color: #0d9488; }
      a:hover { text-decoration: underline; }
      h1 { font-size: 1.5rem; margin-top: 0; }
      ul { padding-left: 1.5rem; }
      .nav { margin-bottom: 1.5rem; }
      .cta { display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; background: #60867D; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 700; }
      .cta:hover { background: #4d6b63; }
    </style>
  </head>
  <body>
    <nav class="nav" aria-label="Navegación">
      <a href="/">Inicio</a> · <a href="/ferias/">Ferias por comuna</a>
    </nav>
    <main>
      <h1>Ferias en ${escapeHtml(comuna)}</h1>
      <p>En ${escapeHtml(comuna)} hay ${ferias.length} feria${ferias.length === 1 ? '' : 's'} libre${ferias.length === 1 ? '' : 's'}. A continuación la lista con días y horarios.</p>
      <ul>
    ${listHtml}
      </ul>
      <p><a href="/" class="cta">Ver todas en el mapa interactivo</a></p>
    </main>
    <footer style="margin-top: 2rem; font-size: 0.875rem; color: #64748b;">
      <a href="/attribuciones.html">Atribuciones y créditos</a>
    </footer>
  </body>
</html>
`;
}

function main() {
  const raw = readFileSync(GEOJSON_PATH, 'utf8');
  const geojson = JSON.parse(raw);
  const features = geojson.features || [];

  const byComuna = new Map();
  for (const f of features) {
    const comuna = getCommune(f);
    if (!comuna) continue;
    if (!byComuna.has(comuna)) byComuna.set(comuna, []);
    byComuna.get(comuna).push(f);
  }

  const comunas = Array.from(byComuna.keys()).sort((a, b) => a.localeCompare(b, 'es'));
  console.log(`Generating ${comunas.length} city pages...`);

  for (const comuna of comunas) {
    const slug = slugify(comuna);
    if (!slug) continue;
    const ferias = byComuna.get(comuna);
    const dir = join(PUBLIC_DIR, 'ferias-en-' + slug);
    mkdirSync(dir, { recursive: true });
    const html = buildCityPage(comuna, slug, ferias);
    writeFileSync(join(dir, 'index.html'), html, 'utf8');
    console.log(`  ferias-en-${slug}/ (${ferias.length} ferias)`);
  }

  // Ferias index page: list all comunas with links to city pages
  const feriasIndexDir = join(PUBLIC_DIR, 'ferias');
  mkdirSync(feriasIndexDir, { recursive: true });
  const indexTitle = 'Ferias por comuna | DóndeHayFeria';
  const indexDesc = 'Lista de ferias libres por comuna en Chile. Santiago, Rancagua, La Reina y más. Ver días y horarios en cada comuna o en el mapa.';
  const indexLinks = comunas
    .map((c) => {
      const s = slugify(c);
      const count = byComuna.get(c).length;
      return `      <li><a href="/ferias-en-${s}/">Ferias en ${escapeHtml(c)}</a> (${count})</li>`;
    })
    .join('\n');
  const feriasIndexHtml = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(indexTitle)}</title>
    <meta name="description" content="${escapeHtml(indexDesc)}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="canonical" href="${BASE_URL}/ferias/" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <!-- Google Analytics (GA4) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}');
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet" />
    <style>
      * { box-sizing: border-box; }
      body { font-family: 'Atkinson Hyperlegible', sans-serif; margin: 0; padding: 1rem 1.5rem; max-width: 48rem; margin-left: auto; margin-right: auto; line-height: 1.5; color: #1e293b; background: #EDE7D6; }
      a { color: #0d9488; }
      a:hover { text-decoration: underline; }
      h1 { font-size: 1.5rem; margin-top: 0; }
      ul { padding-left: 1.5rem; }
      .nav { margin-bottom: 1.5rem; }
      .cta { display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; background: #60867D; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 700; }
      .cta:hover { background: #4d6b63; }
    </style>
  </head>
  <body>
    <nav class="nav" aria-label="Navegación">
      <a href="/">Inicio</a>
    </nav>
    <main>
      <h1>Ferias por comuna</h1>
      <p>Elige una comuna para ver la lista de ferias libres con días y horarios.</p>
      <ul>
${indexLinks}
      </ul>
      <p><a href="/" class="cta">Ver mapa interactivo</a></p>
    </main>
    <footer style="margin-top: 2rem; font-size: 0.875rem; color: #64748b;">
      <a href="/attribuciones.html">Atribuciones y créditos</a>
    </footer>
  </body>
</html>
`;
  writeFileSync(join(feriasIndexDir, 'index.html'), feriasIndexHtml, 'utf8');
  console.log('  ferias/ (index)');

  console.log('Done.');
}

main();
