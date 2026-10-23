#!/usr/bin/env node
// Generate visible location information and matching structured data from the map dataset.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PUBLIC_DIR, BASE_URL, escapeHtml as h, text, loadComunas, cityPath,
  mapLink, breadcrumbs, documentHtml
} from './seo-utils.mjs';

const comunas = loadComunas();
const coverageNote = 'Los días y horarios corresponden a los registros disponibles; no confirman funcionamiento en tiempo real ni cambios por feriados. Consulta con la municipalidad antes de viajar.';

function details(feature) {
  const p = feature.properties ?? {};
  const street = [p.street, p.street_start && `desde ${p.street_start}`, p.street_end && `hasta ${p.street_end}`].filter(Boolean).join(', ');
  return {
    name: String(p.name || 'Feria sin nombre').trim(),
    address: text(p.address || street),
    days: text(p.Días ?? p.days),
    hours: text(p.Horario),
    source: p.source ? String(p.source) : 'Recopilación del proyecto; referencia específica no registrada.',
    sourceUrl: typeof p.source_url === 'string' && /^https:\/\//.test(p.source_url) ? p.source_url : null,
    sourceYear: p.source_year ? ` (año de la fuente: ${p.source_year})` : ''
  };
}
function buildCityPage(comuna, ferias) {
  const path = cityPath(comuna);
  const description = `Consulta ferias libres en ${comuna}: direcciones, días de funcionamiento y horarios informados. Encuentra cada ubicación en el mapa.`;
  const region = String(ferias[0].properties?.region ?? '');
  const records = ferias.map(feature => ({ feature, ...details(feature) }));
  const cards = records.map(({ feature, name, address, days, hours, source, sourceUrl, sourceYear }) => `
    <li class="market-card" id="feria-${h(feature.id)}">
      <h2>${h(name)}</h2>
      <dl>
        <dt>Dirección informada</dt><dd>${h(address)}</dd>
        <dt>Días informados</dt><dd>${h(days)}</dd>
        <dt>Horario informado</dt><dd>${h(hours)}</dd>
      </dl>
      ${feature.geometry.type === 'Point' ? '<p class="muted">Ubicación de referencia: no contamos con el tramo exacto de esta feria.</p>' : ''}
      <p class="muted">Fuente: ${sourceUrl ? `<a href="${h(sourceUrl)}">${h(source)}</a>` : h(source)}${h(sourceYear)}. <a href="/attribuciones.html#datos">Sobre estos datos</a>.</p>
      <a class="cta" href="${h(mapLink(comuna, feature))}">Ver ${h(name)} en el mapa</a>
    </li>`).join('\n');
  const related = comunas.filter(([other, features]) => other !== comuna && features[0].properties?.region === region)
    .slice(0, 6).map(([other]) => `<li><a href="${cityPath(other)}">Ferias en ${h(other)}</a></li>`).join('');
  const itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: `Ferias libres en ${comuna}`, description, numberOfItems: records.length,
    itemListElement: records.map(({ feature, name, address, days, hours }, index) => ({
      '@type': 'ListItem', position: index + 1, name,
      url: `${BASE_URL}${path}#feria-${feature.id}`,
      description: `Dirección informada: ${address} Días informados: ${days}. Horario informado: ${hours}.`
    }))
  };
  return documentHtml({
    title: `Ferias libres en ${comuna}: días y direcciones | DóndeHayFeria`,
    description, path,
    structuredData: [itemList, breadcrumbs([['Inicio', '/'], ['Ferias por comuna', '/ferias/'], [`Ferias en ${comuna}`, path]])],
    content: `
      <h1>Ferias libres en ${h(comuna)}</h1>
      <p>${h(region)}. Consulta las direcciones, días y horarios informados en ${records.length} registro${records.length === 1 ? '' : 's'} de ubicaciones de ferias en esta comuna.</p>
      ${comuna === 'Santiago' ? '<p>Esta página corresponde a la comuna de Santiago, no a toda la Región Metropolitana.</p>' : ''}
      <p class="notice">${coverageNote} <a href="/attribuciones.html#metodologia">Conoce la cobertura y las limitaciones</a>.</p>
      <p><a class="cta" href="${h(mapLink(comuna))}">Ver mapa de ferias en ${h(comuna)}</a></p>
      <ul class="market-cards">${cards}</ul>
      ${related ? `<section><h2>Más comunas de la misma región</h2><ul class="commune-links">${related}</ul></section>` : ''}
      <p><a href="/ferias/">Ver todas las comunas disponibles</a></p>`
  });
}
for (const [comuna, ferias] of comunas) {
  const dir = join(PUBLIC_DIR, cityPath(comuna));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), buildCityPage(comuna, ferias), 'utf8');
}
const regions = new Map();
for (const [comuna, features] of comunas) {
  const region = String(features[0].properties?.region ?? 'Región sin informar');
  if (!regions.has(region)) regions.set(region, []);
  regions.get(region).push(comuna);
}
const directory = [...regions].sort(([a], [b]) => a.localeCompare(b, 'es')).map(([region, names]) => `
  <section><h2>${h(region)}</h2><ul class="commune-links">${names.map(comuna => `<li><a href="${cityPath(comuna)}">Ferias en ${h(comuna)}</a></li>`).join('')}</ul></section>`).join('');
mkdirSync(join(PUBLIC_DIR, 'ferias'), { recursive: true });
writeFileSync(join(PUBLIC_DIR, 'ferias/index.html'), documentHtml({
  title: 'Ferias libres por comuna en Chile: días y direcciones | DóndeHayFeria',
  description: 'Busca ferias libres por región y comuna en Chile. Consulta direcciones, días y horarios informados y abre cada feria en el mapa.',
  path: '/ferias/',
  structuredData: [breadcrumbs([['Inicio', '/'], ['Ferias por comuna', '/ferias/']])],
  content: `<h1>Ferias libres por comuna en Chile</h1>
    <p>Elige una de las ${comunas.length} comunas con registros disponibles para consultar ubicaciones, días y horarios informados.</p>
    <p class="notice">${coverageNote}</p>${directory}`
}), 'utf8');
console.log(`Generated ${comunas.length} comuna pages and the regional directory.`);
