import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from 'tailwindcss';
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
    reactRouter({
      ssr: false,
      prerender: false,
    })
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
      // Ensure React is properly externalized
      external: [],
      onwarn(warning, warn) {
        // Suppress warnings about React being undefined
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
      // Add manual path mappings to replace vite-tsconfig-paths functionality
      '@': resolve(__dirname, './'),
      '~/': resolve(__dirname, './'),
      // Ensure React is properly resolved
      'react': 'react',
      'react-dom': 'react-dom'
    },
  },
  define: {
    // Ensure React is globally available
    'process.env.NODE_ENV': '"production"',
    'global': 'globalThis'
  }
}); 
