import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="w-full px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <a
          href="/attribuciones.html"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        >
          <img
            src="/images/logo.png"
            alt=""
            className="h-8 w-8 shrink-0 object-contain"
            width={32}
            height={32}
          />
          <span>Atribuciones y créditos</span>
        </a>
        <p className="text-xs text-slate-500 dark:text-slate-500">
          Uso no comercial. Mapas © OpenStreetMap, Leaflet, CARTO.
        </p>
      </div>
    </footer>
  );
};
