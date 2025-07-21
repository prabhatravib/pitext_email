import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  plugins: [
    tsconfigPaths(),
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
    },
  },
}); 