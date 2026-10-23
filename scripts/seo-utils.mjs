import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { slugify } from './slugify.mjs';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const PUBLIC_DIR = join(ROOT, 'public');
export const BASE_URL = 'https://dondehayferia.cl';
export const GA_MEASUREMENT_ID = 'G-4RK7CPRL2Z';

export function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
export function jsonLd(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
export function text(value) {
  const raw = String(value ?? '').trim();
  const normalized = raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return !raw || /^(?:0|-+|s\/?[ind]|sin (?:datos|informacion)|no (?:definido|disponible|informado))\.?$/.test(normalized)
    ? 'Información no disponible.' : raw;
}
export function loadComunas() {
  const { features } = JSON.parse(readFileSync(join(PUBLIC_DIR, 'data/Ferias_de_Chile.geojson'), 'utf8'));
  const groups = new Map();
  for (const feature of features) {
    const comuna = String(feature.properties?.comuna ?? feature.properties?.commune ?? '').trim();
    if (!comuna) continue;
    if (!groups.has(comuna)) groups.set(comuna, []);
    groups.get(comuna).push(feature);
  }
  const entries = [...groups].sort(([a], [b]) => a.localeCompare(b, 'es'));
  const slugs = entries.map(([comuna]) => slugify(comuna));
  if (slugs.some(slug => !slug) || new Set(slugs).size !== slugs.length) {
    throw new Error('Comuna URLs must have unique, non-empty slugs.');
  }
  return entries;
}
export function cityPath(comuna) { return `/ferias-en-${slugify(comuna)}/`; }
export function mapLink(comuna, feature) {
  const params = new URLSearchParams({ comuna });
  if (feature?.id != null) params.set('feria', String(feature.id));
  return `/?${params}`;
}
export function breadcrumbs(items) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], index) => ({
      '@type': 'ListItem', position: index + 1, name, item: BASE_URL + path
    }))
  };
}
export function documentHtml({ title, description, path, content, structuredData = [] }) {
  const url = BASE_URL + path;
  return `<!doctype html>
<html lang="es-CL">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="stylesheet" href="/seo.css" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${BASE_URL}/og-default.png" />
  <meta property="og:locale" content="es_CL" />
  <meta property="og:site_name" content="DóndeHayFeria" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${BASE_URL}/og-default.png" />
  ${structuredData.map(data => `<script type="application/ld+json">${jsonLd(data)}</script>`).join('\n  ')}
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}');
  </script>
</head>
<body class="directory-page">
  <nav aria-label="Navegación principal"><a href="/">Mapa de ferias</a> · <a href="/ferias/">Ferias por comuna</a></nav>
  <main>${content}</main>
  <footer><a href="/attribuciones.html">Fuentes, metodología y créditos</a></footer>
</body>
</html>
`.replace(/[\t ]+$/gm, '');
}
