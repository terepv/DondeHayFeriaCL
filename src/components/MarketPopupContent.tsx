import React from 'react';
import type { MarketFeature } from '../types/market';
import { getFeatureCenter } from '../utils/geometry';
import { getName, getRegion, getCommune, getDays, getHorario, getAddress } from '../utils/marketUtils';

interface MarketPopupContentProps {
  feature: MarketFeature;
}

export const MarketPopupContent: React.FC<MarketPopupContentProps> = ({ feature }) => {
  const name = getName(feature);
  const region = getRegion(feature);
  const comuna = getCommune(feature);
  const days = getDays(feature);
  const horario = getHorario(feature);
  const address = getAddress(feature);
  const center = getFeatureCenter(feature);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;

  return (
    <div className="text-slate-900 dark:text-slate-100 w-max min-w-0 max-w-[280px] break-words">
      <h3 className="text-base font-semibold mb-1 flex flex-wrap items-center gap-x-2 gap-y-0">
        <span>{name}</span>
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0"
          aria-hidden
        />
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Cómo llego?
        </a>
      </h3>
      {address && (
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <span className="font-medium">Dirección:</span> {address}
        </p>
      )}
      {(comuna || region) && (
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {comuna && (
            <>
              <span className="font-medium">Comuna:</span> {comuna}
            </>
          )}
          {comuna && region && <br />}
          {region && (
            <>
              <span className="font-medium">Región:</span> {region}
            </>
          )}
        </p>
      )}
      {days && (
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <span className="font-medium">Días:</span> {days}
        </p>
      )}
      {horario && (
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <span className="font-medium">Horario:</span> {horario}
        </p>
      )}
    </div>
  );
};
