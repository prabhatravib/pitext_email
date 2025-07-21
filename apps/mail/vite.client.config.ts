import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  plugins: [
    // Removed vite-tsconfig-paths plugin due to Vite 6 compatibility issues
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
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
  },
  resolve: {
    alias: {
      tslib: 'tslib/tslib.es6.js',
      // Add manual path mappings to replace vite-tsconfig-paths functionality
      '@': resolve(__dirname, './'),
      '~/': resolve(__dirname, './'),
    },
  },
}); 