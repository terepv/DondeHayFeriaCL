#!/usr/bin/env node
// Validate deployment artifacts, not just the source templates.
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  ROOT, BASE_URL, loadComunas, cityPath, mapLink, jsonLd, escapeHtml
} from './seo-utils.mjs';

const dist = join(ROOT, 'dist');
const comunas = loadComunas();
const expectedPaths = ['/', '/ferias/', '/attribuciones.html', ...comunas.map(([name]) => cityPath(name))];
const pathToFile = path => join(dist, path.endsWith('/') ? `${path}index.html` : path);
const htmlByPath = new Map(expectedPaths.map(path => [path, readFileSync(pathToFile(path), 'utf8')]));
const decodeAttribute = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const allIds = new Map(comunas.flatMap(([comuna, features]) => features.map(feature => [String(feature.id), comuna])));
const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
assert.equal(sitemapUrls.length, new Set(sitemapUrls).size, 'Duplicate sitemap URLs');
assert.deepEqual([...sitemapUrls].sort(), expectedPaths.map(path => BASE_URL + path).sort(), 'Sitemap coverage differs from the dataset');
assert(!sitemap.includes('<lastmod>'), 'Do not fabricate modification dates');
assert(readFileSync(join(dist, 'robots.txt'), 'utf8').includes(`Sitemap: ${BASE_URL}/sitemap.xml`));
assert.deepEqual(
  readdirSync(dist, { withFileTypes: true }).filter(entry => entry.isDirectory() && entry.name.startsWith('ferias-en-')).map(entry => `/${entry.name}/`).sort(),
  comunas.map(([name]) => cityPath(name)).sort(), 'Stale or missing generated comuna directories'
);

for (const [path, html] of htmlByPath) {
  assert(!/\b[\w-]+\.(?:xlsx|xls|geojson)\b/i.test(html), `${path}: internal data filenames must not appear in public HTML`);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${path}: expected one H1`);
  assert(/<title>[^<]+<\/title>/.test(html), `${path}: missing title`);
  assert(/<meta name="description" content="[^"]+"/.test(html), `${path}: missing description`);
  assert(html.includes(`<link rel="canonical" href="${BASE_URL}${path}"`), `${path}: incorrect canonical`);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1, `${path}: duplicate canonical`);
  assert(!/content="[^"]*\b(?:noindex|nosnippet)\b/.test(html), `${path}: indexing blocked`);
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    JSON.parse(match[1]);
  }
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = decodeAttribute(match[1]);
    const url = new URL(raw, BASE_URL + path);
    if (url.origin !== BASE_URL) continue;
    const targetFile = pathToFile(decodeURIComponent(url.pathname));
    assert(existsSync(targetFile), `${path}: missing local target ${raw}`);
    if (url.hash && (url.pathname.endsWith('.html') || htmlByPath.has(url.pathname))) {
      const targetHtml = htmlByPath.get(url.pathname) ?? readFileSync(targetFile, 'utf8');
      assert(targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${path}: broken anchor ${raw}`);
    }
    if (url.pathname === '/' && url.searchParams.has('comuna')) {
      const comuna = url.searchParams.get('comuna');
      assert(comunas.some(([name]) => name === comuna), `${path}: unknown comuna in map link`);
      if (url.searchParams.has('feria')) {
        assert.equal(allIds.get(url.searchParams.get('feria')), comuna, `${path}: map link points to the wrong feria`);
      }
    }
  }
}
const home = htmlByPath.get('/');
const heading = readFileSync(join(ROOT, 'src/content/home-heading.html'), 'utf8').trim();
assert(home.includes(heading), 'Homepage must include the same heading as React');
const footer = readFileSync(join(ROOT, 'src/content/footer-content.html'), 'utf8').trim();
assert(home.includes(footer), 'Initial HTML must retain the same crawlable footer as React');
const footerDestinations = [...footer.matchAll(/href="([^"]+)"/g)].map(match => new URL(match[1], BASE_URL).pathname);
assert.equal(new Set(footerDestinations).size, footerDestinations.length, 'Footer links repeat a destination');
assert(home.includes('<noscript>'), 'Missing no-JavaScript directory access');
const directory = htmlByPath.get('/ferias/');
for (const [comuna, features] of comunas) {
  const path = cityPath(comuna);
  assert(directory.includes(`href="${path}"`), `${comuna}: missing directory link`);
  const html = htmlByPath.get(path);
  const list = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(match => JSON.parse(match[1])).find(data => data['@type'] === 'ItemList');
  assert.equal(list.numberOfItems, features.length, `${comuna}: incorrect structured-data count`);
  assert.equal((html.match(/class="market-card"/g) || []).length, features.length, `${comuna}: missing visible records`);
  for (const feature of features) {
    assert(html.includes(escapeHtml(mapLink(comuna, feature))), `${comuna}: missing feria map link`);
    if (feature.properties.address) assert(html.includes(escapeHtml(feature.properties.address)), `${comuna}: address omitted`);
  }
}
// Imported text must not be able to terminate an inline JSON-LD script.
assert(!jsonLd({ name: '</script><script>alert(1)</script>' }).includes('<'));
console.log(`SEO validated: ${expectedPaths.length} pages, ${allIds.size} location links, local assets, anchors and sitemap coverage.`);
