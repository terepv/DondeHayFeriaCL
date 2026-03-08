import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for React + TS
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});