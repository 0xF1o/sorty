import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  // Stamped at build time, in UTC. The title screen renders it in the viewer's local time.
  define: { __BUILD_TIME__: JSON.stringify(new Date().toISOString()) },
  build: { target: 'es2022', assetsInlineLimit: 0 },
  server: { port: 7317, strictPort: false },
});
