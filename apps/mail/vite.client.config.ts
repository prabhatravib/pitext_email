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
  },
  resolve: {
    alias: {
      tslib: 'tslib/tslib.es6.js',
    },
  },
}); 