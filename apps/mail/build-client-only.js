#!/usr/bin/env node

import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function buildClientOnly() {
  try {
    console.log('Building client-side only...');
    console.log('Current directory:', process.cwd());
    console.log('Script directory:', __dirname);
    
    // Set required environment variables for build
    process.env.NODE_ENV = 'production';
    process.env.VITE_BUILD_MODE = 'production';
    process.env.CI = 'true';
    
    // Check if required files exist
    const indexHtmlPath = resolve(__dirname, 'index.html');
    const viteConfigPath = resolve(__dirname, 'vite.client.config.ts');
    
    console.log('Checking required files...');
    console.log('index.html exists:', fs.existsSync(indexHtmlPath));
    console.log('vite.client.config.ts exists:', fs.existsSync(viteConfigPath));
    
    if (!fs.existsSync(indexHtmlPath)) {
      throw new Error('index.html not found');
    }
    
    if (!fs.existsSync(viteConfigPath)) {
      throw new Error('vite.client.config.ts not found');
    }
    
    console.log('Starting Vite build...');
    
    await build({
      configFile: viteConfigPath,
      mode: 'production',
      build: {
        outDir: 'build/client',
        emptyOutDir: true,
        rollupOptions: {
          input: {
            main: indexHtmlPath
          }
        }
      }
    });
    
    // Verify the build output
    const buildPath = resolve(__dirname, 'build/client');
    const indexPath = resolve(buildPath, 'index.html');
    
    console.log('Verifying build output...');
    console.log('Build directory exists:', fs.existsSync(buildPath));
    console.log('index.html exists:', fs.existsSync(indexPath));
    
    if (!fs.existsSync(buildPath)) {
      throw new Error('Build directory was not created');
    }
    
    if (!fs.existsSync(indexPath)) {
      throw new Error('index.html was not generated in build output');
    }
    
    if (fs.existsSync(buildPath)) {
      const buildFiles = fs.readdirSync(buildPath);
      console.log('Build files:', buildFiles.slice(0, 10));
    }
    
    console.log('✅ Client-only build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

buildClientOnly(); 