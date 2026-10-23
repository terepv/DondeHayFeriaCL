#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createServer } from 'vite';

// Exercise HTTP routing: checking that files exist alone misses Vite's SPA fallback.
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
try {
  await server.listen();
  const origin = server.resolvedUrls.local[0];
  const cases = [
    ['/ferias/', 'Ferias libres por comuna en Chile'],
    ['/ferias', 'Ferias libres por comuna en Chile'],
    ['/ferias/?origen=mapa', 'Ferias libres por comuna en Chile'],
    ['/ferias-en-nunoa/', 'Ferias libres en Ñuñoa'],
    ['/ferias-en-nunoa', 'Ferias libres en Ñuñoa'],
    ['/ferias-en-santiago/', 'Ferias libres en Santiago']
  ];
  for (const [path, title] of cases) {
    const response = await fetch(new URL(path, origin));
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert(html.includes(`<title>${title}`), `${path} did not serve the generated page`);
    assert(!html.includes('/src/main.tsx'), `${path} incorrectly fell back to the React app`);
  }
  const home = await (await fetch(origin)).text();
  assert(home.includes('/src/main.tsx'), 'The homepage should still serve the React app');
  const unknown = await (await fetch(new URL('/ferias-en-not-a-real-comuna/', origin))).text();
  assert(unknown.includes('/src/main.tsx'), 'Unknown comunas must retain the existing not-found handling');
  console.log(`Development routing validated: ${cases.length} directory URLs, homepage and unknown-route fallback.`);
} finally {
  await server.close();
}
