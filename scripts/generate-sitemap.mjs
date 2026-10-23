#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BASE_URL, PUBLIC_DIR, loadComunas, cityPath } from './seo-utils.mjs';

// Omit lastmod until genuine per-page modification dates are available.
// A deployment date does not establish that the underlying data was verified.
const paths = ['/', '/ferias/', '/attribuciones.html', ...loadComunas().map(([comuna]) => cityPath(comuna))];
writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map(path => `  <url><loc>${BASE_URL}${path}</loc></url>`).join('\n')}
</urlset>
`, 'utf8');
writeFileSync(join(PUBLIC_DIR, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml\n`, 'utf8');
console.log(`Sitemap generated (${paths.length} URLs).`);
