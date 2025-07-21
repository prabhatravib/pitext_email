import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import babel from 'vite-plugin-babel';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const ReactCompilerConfig = {
  /* ... */
};

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    reactRouter({
      ssr: false,
      prerender: false,
    }),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: [
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript'
        ],
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
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
