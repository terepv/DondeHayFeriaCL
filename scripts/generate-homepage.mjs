import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './seo-utils.mjs';

const path = join(ROOT, 'index.html');
const original = readFileSync(path, 'utf8');
const heading = readFileSync(join(ROOT, 'src/content/home-heading.html'), 'utf8').trim();
const footer = readFileSync(join(ROOT, 'src/content/footer-content.html'), 'utf8').trim();
const pattern = /<!-- home-content:start -->[\s\S]*?<!-- home-content:end -->/;
if (!pattern.test(original)) throw new Error('Homepage content markers are missing.');
writeFileSync(path, original.replace(pattern, `<!-- home-content:start -->
      <section class="home-fallback" aria-label="Encuentra tu feria">
${heading}
      </section>
      <noscript><p class="home-fallback">El mapa necesita JavaScript. Puedes consultar el directorio por comuna al pie de esta página.</p></noscript>
      <footer class="site-footer">
${footer}
      </footer>
      <!-- home-content:end -->`), 'utf8');
console.log('Homepage HTML and React content synchronized.');
