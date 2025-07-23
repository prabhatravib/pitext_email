import { defineConfig } from 'vite';
import tailwindcss from 'tailwindcss';
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
      },
      external: [],
      onwarn(warning, warn) {
        if (warning.code === 'MISSING_EXPORT' && warning.message.includes('React')) {
          return;
        }
        warn(warning);
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
      '@': resolve(__dirname, './'),
      '~/': resolve(__dirname, './'),
      'react': 'react',
      'react-dom': 'react-dom'
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'global': 'globalThis'
  }
}); 
