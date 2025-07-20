#!/usr/bin/env node

import { execSync } from 'child_process';
import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function buildSimple() {
  try {
    console.log('🚀 Starting simple client build...');
    console.log('📁 Current directory:', process.cwd());
    console.log('📁 Script directory:', __dirname);
    console.log('🔧 Node version:', process.version);
    console.log('🔧 NODE_ENV:', process.env.NODE_ENV || 'production');
    
    // First, compile paraglide (required for i18n)
    console.log('🌐 Compiling Paraglide...');
    try {
      execSync('npx @inlang/paraglide-js compile --project project.inlang', {
        cwd: __dirname,
        stdio: 'inherit'
      });
      console.log('✅ Paraglide compiled');
    } catch (error) {
      console.log('⚠️  Paraglide compilation failed (might be okay if not using i18n)');
    }
    
    // Check if required files exist
    const indexHtmlPath = resolve(__dirname, 'index.html');
    const viteConfigPath = resolve(__dirname, 'vite.client.config.ts');
    
    console.log('🔍 Checking required files...');
    console.log('index.html exists:', fs.existsSync(indexHtmlPath));
    console.log('vite.client.config.ts exists:', fs.existsSync(viteConfigPath));
    
    if (!fs.existsSync(indexHtmlPath)) {
      console.error('❌ index.html not found at:', indexHtmlPath);
      process.exit(1);
    }
    
    // Build using Vite with client config
    console.log('🔨 Building with Vite (client config)...');
    try {
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
      console.log('✅ Vite build completed');
    } catch (error) {
      console.error('❌ Vite build failed:', error instanceof Error ? error.message : 'Unknown error');
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
    
    // Verify build output
    console.log('🔍 Verifying build output...');
    const buildDir = resolve(__dirname, 'build/client');
    
    if (fs.existsSync(buildDir)) {
      const files = fs.readdirSync(buildDir);
      console.log('✅ Build completed successfully!');
      console.log('📁 Build directory:', buildDir);
      console.log('📄 Files in build:', files.slice(0, 10), files.length > 10 ? `... and ${files.length - 10} more` : '');
      
      // Check for critical files
      const indexPath = resolve(buildDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        console.log('✅ index.html exists');
        const stats = fs.statSync(indexPath);
        console.log(`📄 index.html size: ${stats.size} bytes`);
      } else {
        console.log('❌ index.html missing');
        process.exit(1);
      }
      
      // Check for assets directory
      const assetsDir = resolve(buildDir, 'assets');
      if (fs.existsSync(assetsDir)) {
        const assetFiles = fs.readdirSync(assetsDir);
        console.log('✅ Assets directory exists with', assetFiles.length, 'files');
      } else {
        console.log('⚠️  Assets directory not found (build might have failed)');
      }
      
      console.log('✅ Build verification passed');
    } else {
      console.log('❌ Build directory not found after build');
      console.log('📁 Current directory contents:', fs.readdirSync(__dirname));
      process.exit(1);
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