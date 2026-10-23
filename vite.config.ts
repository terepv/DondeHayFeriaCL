import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// Vite config for React + TS
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'static-directory-pages',
      configureServer(server) {
        // Vite serves public HTML files directly but otherwise treats directory
        // URLs as SPA routes. Resolve generated directories before that fallback.
        server.middlewares.use((req, _res, next) => {
          const url = new URL(req.url ?? '/', 'http://localhost');
          if (/^\/(?:ferias|ferias-en-[a-z0-9-]+)\/?$/.test(url.pathname)) {
            const directory = url.pathname.replace(/\/$/, '');
            if (existsSync(join(server.config.publicDir, directory, 'index.html'))) {
              req.url = `${directory}/index.html${url.search}`;
            }
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5173
  }
});
