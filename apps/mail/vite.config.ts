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
});
