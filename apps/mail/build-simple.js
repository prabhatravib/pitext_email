#!/usr/bin/env node

import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function buildSimple() {
  try {
    console.log('🚀 Starting simple client build...');
    
    // Create build directory
    const buildDir = resolve(__dirname, 'build/client');
    console.log('📁 Build directory:', buildDir);
    
    // Ensure build directory exists
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
      console.log('✅ Created build directory');
    } else {
      console.log('✅ Build directory already exists');
    }
    
    // Copy index.html to build directory
    const sourceHtml = resolve(__dirname, 'index.html');
    const targetHtml = resolve(buildDir, 'index.html');
    
    console.log('📄 Source HTML:', sourceHtml);
    console.log('📄 Target HTML:', targetHtml);
    
    if (fs.existsSync(sourceHtml)) {
      fs.copyFileSync(sourceHtml, targetHtml);
      console.log('✅ Copied index.html to build directory');
    } else {
      console.log('❌ index.html not found at:', sourceHtml);
      console.log('Available files in current directory:', fs.readdirSync(__dirname));
      return;
    }
    
    // Build assets with Vite
    console.log('🔨 Building with Vite...');
    await build({
      configFile: resolve(__dirname, 'vite.client.config.ts'),
      mode: 'production',
      build: {
        outDir: buildDir,
        emptyOutDir: false, // Don't empty since we copied index.html
        rollupOptions: {
          output: {
            manualChunks: undefined, // Disable chunk splitting for simpler build
          }
        }
      }
    });
    
    // Verify build output
    console.log('🔍 Verifying build output...');
    if (fs.existsSync(buildDir)) {
      const files = fs.readdirSync(buildDir);
      console.log('✅ Build completed successfully!');
      console.log('📁 Build directory:', buildDir);
      console.log('📄 Files in build:', files);
      
      // Check for critical files
      const criticalFiles = ['index.html'];
      for (const file of criticalFiles) {
        if (fs.existsSync(resolve(buildDir, file))) {
          console.log(`✅ ${file} exists`);
        } else {
          console.log(`❌ ${file} missing`);
        }
      }
    } else {
      console.log('❌ Build directory not found after build');
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

buildSimple(); 