import type { MarketFeature } from '../types/market';
import { isReferenceLocation, REFERENCE_LOCATION_DESCRIPTION } from '../utils/marketUtils';

export function MarketLocationNote({ feature }: { feature: MarketFeature }) {
  if (!isReferenceLocation(feature)) return null;

  return (
    <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
      <p className="font-semibold">Ubicación referencial</p>
      <p className="mt-0.5">{REFERENCE_LOCATION_DESCRIPTION}</p>
    </div>
  );
}
