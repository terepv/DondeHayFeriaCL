import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#EDE7D6] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-center max-w-md">
          La ruta que buscas no existe. Puedes volver al mapa o ver la lista de ferias por comuna.
        </p>
        <nav className="flex flex-wrap gap-4 justify-center" aria-label="Opciones de navegación">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-[#60867D] px-4 py-2 text-white font-medium hover:bg-[#4d6b63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60867D] focus-visible:ring-offset-2"
          >
            Ver mapa de ferias
          </Link>
          <a
            href="/ferias/"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Ferias por comuna
          </a>
        </nav>
      </main>
    </div>
  );
};
