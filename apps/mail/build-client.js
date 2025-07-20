#!/usr/bin/env node

import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function buildClient() {
  try {
    console.log('Building client-side only...');
    
    await build({
      configFile: resolve(__dirname, 'vite.config.ts'),
      mode: 'production',
      build: {
        outDir: 'build/client',
        emptyOutDir: true,
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'app/entry.client.tsx')
          }
        }
      }
    });
    
    console.log('✅ Client build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildClient(); 