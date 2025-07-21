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
    
    // Ensure build directory exists
    const buildDir = resolve(__dirname, 'build/client');
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
      console.log('Created build directory:', buildDir);
    }
    
    // Build with explicit configuration
    const result = await build({
      configFile: viteConfigPath,
      mode: 'production',
      root: __dirname,
      build: {
        outDir: 'build/client',
        emptyOutDir: true,
        rollupOptions: {
          input: {
            main: indexHtmlPath
          },
          output: {
            manualChunks: undefined,
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]'
          }
        }
      }
    });
    
    console.log('Build result:', result);
    
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
      console.error('❌ index.html was not generated in build output');
      console.error('Available files in build directory:');
      if (fs.existsSync(buildPath)) {
        const buildFiles = fs.readdirSync(buildPath);
        console.error(buildFiles);
      }
      throw new Error('index.html was not generated in build output');
    }
    
    // Read and verify index.html content
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    console.log('index.html content length:', indexContent.length);
    console.log('index.html starts with DOCTYPE:', indexContent.startsWith('<!DOCTYPE'));
    
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