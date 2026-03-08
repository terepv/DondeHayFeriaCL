import type { MarketFeature } from '../types/market';

// --- Feature identity ---

export function getFeatureId(feature: MarketFeature, index: number): string {
  const id = feature.id ?? feature.properties?.id;
  if (id != null) return String(id);
  const name = feature.properties?.name ?? 'market';
  return `${name}-${index}`;
}

// --- Centralized property access (handles comuna/commune, days/Días, etc.) ---

export function getRegion(feature: MarketFeature): string | undefined {
  const raw = feature.properties?.region;
  return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : undefined;
}

export function getCommune(feature: MarketFeature): string | undefined {
  const { comuna, commune } = feature.properties ?? {};
  const value = (comuna ?? commune) as string | undefined;
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

export function getName(feature: MarketFeature): string {
  return (feature.properties?.name as string) ?? 'Feria sin nombre';
}

export function getDays(feature: MarketFeature): string {
  return (
    (feature.properties?.days as string | undefined) ??
    (feature.properties?.Días as string | undefined) ??
    ''
  );
}

export function getHorario(feature: MarketFeature): string {
  return (feature.properties?.Horario as string | undefined) ?? '';
}

export function getAddress(feature: MarketFeature): string {
  return (feature.properties?.address as string | undefined) ?? '';
}

// --- Weekdays filter ---

/** Weekdays for Días filter (display order; Lunes last with tooltip). */
export const DIAS_SEMANA = [
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
  'Lunes'
] as const;

/** 3-letter abbreviations used in data (e.g. "Vie" in "Martes - Vie"). */
const DAY_ABBREVS: Record<string, string> = {
  Lunes: 'lun',
  Martes: 'mar',
  Miércoles: 'mie',
  Jueves: 'jue',
  Viernes: 'vie',
  Sábado: 'sab',
  Domingo: 'dom'
};

/** Normalize string for day matching: lowercase, strip accents. */
function normalizeForDayMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\u0307/g, '')
    .replace(/[\u0300-\u036f]/g, '');
}

/** True if the market's Días string indicates it opens on the given day (or its abbreviation). */
export function marketOpensOnDay(diasStr: string, day: string): boolean {
  if (!diasStr.trim()) return false;
  const normalized = normalizeForDayMatch(diasStr);
  const dayNorm = normalizeForDayMatch(day);
  const abbrev = DAY_ABBREVS[day];
  return normalized.includes(dayNorm) || (abbrev != null && normalized.includes(abbrev));
}
