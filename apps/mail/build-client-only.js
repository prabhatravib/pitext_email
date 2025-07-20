#!/usr/bin/env node

import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function buildClientOnly() {
  try {
    console.log('Building client-side only...');
    
    await build({
      configFile: resolve(__dirname, 'vite.client.config.ts'),
      mode: 'production',
      build: {
        outDir: 'build/client',
        emptyOutDir: true,
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'index.html')
          }
        }
      }
    });
    
    console.log('✅ Client-only build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildClientOnly(); 