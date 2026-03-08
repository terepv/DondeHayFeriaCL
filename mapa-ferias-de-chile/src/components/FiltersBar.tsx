import React from 'react';
import { clsx } from 'clsx';

interface FiltersBarProps {
  regions: string[];
  communes: string[];
  diasSemana: readonly string[];
  selectedRegion: string;
  selectedCommune: string;
  selectedDias: string[];
  onRegionChange: (value: string) => void;
  onCommuneChange: (value: string) => void;
  onDiasChange: (days: string[]) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  geoError: string | null;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  regions,
  communes,
  diasSemana,
  selectedRegion,
  selectedCommune,
  selectedDias,
  onRegionChange,
  onCommuneChange,
  onDiasChange,
  searchTerm,
  onSearchTermChange,
  geoError
}) => {
  const handleDiasToggle = (day: string) => {
    if (selectedDias.includes(day)) {
      onDiasChange(selectedDias.filter((d) => d !== day));
    } else {
      onDiasChange([...selectedDias, day]);
    }
  };

  const searchId = 'search-ferias';

  return (
    <section
      aria-labelledby="filters-heading"
      className="bg-white dark:bg-slate-800 rounded-lg shadow px-4 py-3 md:px-5 md:py-4 flex flex-col gap-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 id="filters-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Filtros
        </h2>
        <div className="relative w-full sm:w-auto sm:min-w-[280px] sm:max-w-md">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" aria-hidden>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            id={searchId}
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Nombre, comuna o región…"
            aria-label="Buscar por nombre, comuna o región"
            className="block w-full rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 pl-10 pr-2.5 py-1.5 text-sm shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>
      </div>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Filtrar ferias por texto y ubicación"
      >
        <div className="flex flex-col md:flex-row gap-3 md:items-start">
          <fieldset className="flex-1 md:max-w-xs flex flex-col">
            <legend className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-0.5">
              Región
            </legend>
            <label className="sr-only" htmlFor="region">
              Seleccionar región
            </label>
            <select
              id="region"
              value={selectedRegion}
              onChange={(e) => {
                onRegionChange(e.target.value);
                onCommuneChange('all');
              }}
              className="select-chevron-inset block w-full rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 pl-2.5 pr-8 py-1.5 text-sm shadow-sm focus:border-primary focus:ring-primary bg-white"
            >
              <option value="all">Todas las regiones</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className="flex-1 md:max-w-xs flex flex-col">
            <legend className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-0.5">
              Comuna
            </legend>
            <label className="sr-only" htmlFor="commune">
              Seleccionar comuna
            </label>
            <select
              id="commune"
              value={selectedCommune}
              onChange={(e) => onCommuneChange(e.target.value)}
              disabled={communes.length === 0}
              className="select-chevron-inset block w-full rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 pl-2.5 pr-8 py-1.5 text-sm shadow-sm focus:border-primary focus:ring-primary bg-white disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-600 dark:disabled:text-slate-500"
            >
              <option value="all">
                {communes.length === 0
                  ? 'Todas las comunas'
                  : 'Todas en la región seleccionada'}
              </option>
              {communes.map((commune) => (
                <option key={commune} value={commune}>
                  {commune}
                </option>
              ))}
            </select>
          </fieldset>
        </div>

        <fieldset className="border-0 p-0 m-0">
          <legend className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Días de apertura
          </legend>
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1"
            role="group"
            aria-label="Seleccionar uno o más días"
          >
            {diasSemana.map((day) => (
                <label
                  key={day}
                  className="inline-flex items-center gap-1.5 text-base text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedDias.includes(day)}
                    onChange={() => handleDiasToggle(day)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  {day === 'Lunes' ? (
                    <span className="inline-flex items-center gap-0.5">
                      <span>{day}</span>
                      <span
                        className="relative inline-flex group"
                        onClick={(e) => e.preventDefault()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                      <span
                        className="inline-flex items-center justify-center w-3 h-3 rounded-full border border-slate-400 dark:border-slate-500 text-slate-500 dark:text-slate-400 text-[8px] font-semibold cursor-help select-none"
                        aria-label="Información sobre Lunes"
                      >
                        i
                      </span>
                      <span
                        role="tooltip"
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-slate-800 dark:bg-slate-700 text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow"
                      >
                        La mayoría de las ferias descansan los lunes 😴
                      </span>
                    </span>
                  </span>
                  ) : (
                    <span>{day}</span>
                  )}
                </label>
              ))}
          </div>
        </fieldset>

        {geoError && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {geoError}
          </p>
        )}
      </form>
    </section>
  );
};

