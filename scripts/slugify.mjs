/**
 * Normalize comuna name to URL slug: lowercase, spaces to hyphens, strip accents.
 * "La Reina" -> "la-reina", "Ñuñoa" -> "nunoa"
 */
export function slugify(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining marks (accents)
    .replace(/ñ/g, 'n')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
