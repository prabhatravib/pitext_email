#!/usr/bin/env node

import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function buildSimple() {
  try {
    console.log('Building simple client...');
    
    // Create build directory
    const buildDir = resolve(__dirname, 'build/client');
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }
    
    // Copy index.html to build directory
    const sourceHtml = resolve(__dirname, 'index.html');
    const targetHtml = resolve(buildDir, 'index.html');
    
    if (fs.existsSync(sourceHtml)) {
      fs.copyFileSync(sourceHtml, targetHtml);
      console.log('✅ Copied index.html to build directory');
    } else {
      console.log('❌ index.html not found');
      return;
    }
    
    // Build assets with Vite
    await build({
      configFile: resolve(__dirname, 'vite.client.config.ts'),
      mode: 'production',
      build: {
        outDir: buildDir,
        emptyOutDir: false, // Don't empty since we copied index.html
      }
    });
    
    console.log('✅ Simple build completed successfully!');
    console.log('Build directory:', buildDir);
    console.log('Files in build:', fs.readdirSync(buildDir));
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildSimple(); 