import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Marketing SPA. Prerendering happens as a post-build step (scripts/prerender.js),
// not via an SSR framework — see the project spec §3.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Keep the bundle lean — this is a marketing site, not the portal app.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
  server: {
    port: 5175,
  },
  preview: {
    port: 4175,
  },
  test: {
    // Unit tests only — pure logic (mock adapter, schemas, utils). No DOM needed.
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
});
