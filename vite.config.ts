/// <reference types="vitest/config" />

import path from 'path';
import react from '@vitejs/plugin-react';
import { loadEnv, defineConfig } from 'vite';

const env = loadEnv(process.env.NODE_ENV as string, process.cwd(), 'VITE_');

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    cors: false,
    proxy: {
      // El frontend hace requests a /api/v1/... (axios baseURL).
      // El backend NestJS también sirve en /api/v1/... (setGlobalPrefix + URI versioning).
      // VITE_API_URL es la URL base del backend (sin /api). Sin rewrite — el path va tal cual.
      '/api': {
        target: env.VITE_API_URL,
        secure: false,
        changeOrigin: true,
        ws: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
