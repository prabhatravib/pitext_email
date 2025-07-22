import { reactRouter } from '@react-router/dev/vite';
import babel from 'vite-plugin-babel';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      babel: {
        plugins: []
      }
    }),
    reactRouter(),
  ],
  server: {
    port: 3000,
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  build: {
    sourcemap: false,
    outDir: 'build/client',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      tslib: 'tslib/tslib.es6.js',
      '@': resolve(__dirname, './'),
      '~/': resolve(__dirname, './'),
      'react': 'react',
      'react-dom': 'react-dom'
    },
  },
  define: {
    // Nuclear option: Force production mode even in development
    // This completely eliminates dev tools conflicts
    'process.env.NODE_ENV': '"production"',
    'import.meta.env.DEV': 'false',
    'import.meta.env.PROD': 'true',
    // Disable React Router dev tools to prevent HydratedRouter conflicts
    'process.env.REACT_ROUTER_DEV_TOOLS': 'false',
  },
});
