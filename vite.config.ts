import { defineConfig } from 'vite';

// In development Vite proxies the backend (/api) and the display registry (/registry) so the app is one origin.
const api = process.env.API_TARGET || 'http://127.0.0.1:5080';
const registry = process.env.REGISTRY_TARGET || 'http://127.0.0.1:8130';
const proxy = {
  '/api': { target: api, changeOrigin: true },
  '/registry': { target: registry, changeOrigin: true, rewrite: (p: string) => p.replace(/^\/registry/, '') },
};

export default defineConfig(({ mode }) => ({
  // relative asset URLs: the same build runs at / (dev) and under /lab/gridtrade/ (portfolio)
  base: './',
  esbuild: { jsx: 'automatic' },
  // one React for the app and the @extreact packages
  resolve: { dedupe: ['react', 'react-dom', 'ag-grid-community', 'ag-grid-react'] },
  server: { port: 5173, proxy },
  preview: { port: 4173, proxy },
  // no source maps in the portfolio build: they triple the upload to a shared host and nobody debugs there
  build: { outDir: 'dist', chunkSizeWarningLimit: 4000, sourcemap: mode !== 'portfolio' }
}));
