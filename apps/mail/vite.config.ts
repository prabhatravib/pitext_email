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
      // React 19 specific configuration
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      // Disable React compiler for now to avoid conflicts
      babel: {
        plugins: []
      }
    }),
    reactRouter(),
    // Remove babel plugin that was causing React compiler issues
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
      // Add manual path mappings to replace vite-tsconfig-paths functionality
      '@': resolve(__dirname, './'),
      '~/': resolve(__dirname, './'),
      // Ensure React is properly resolved
      'react': 'react',
      'react-dom': 'react-dom'
    },
  },
  // Removed the babelConfig since we're using the react plugin instead
});
