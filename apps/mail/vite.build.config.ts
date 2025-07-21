import { defineConfig } from 'vite';
import tailwindcss from 'tailwindcss';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  plugins: [
    // Removed vite-tsconfig-paths plugin due to Vite 6 compatibility issues
  ],
  build: {
    sourcemap: false,
    outDir: 'build/client',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        manualChunks: undefined,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
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