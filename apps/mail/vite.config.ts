import { reactRouter } from '@react-router/dev/vite';
import babel from 'vite-plugin-babel';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import { resolve } from 'path';

const ReactCompilerConfig = {
  /* ... */
};

export default defineConfig({
  base: '/',
  plugins: [
    reactRouter({
      ssr: false,
      prerender: false,
    }),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ['@babel/preset-typescript'],
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
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
