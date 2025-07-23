#!/usr/bin/env node

import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildWithFallback() {
  try {
    console.log('🔨 Starting build with fallback...');
    console.log('Current directory:', process.cwd());
    console.log('Script directory:', __dirname);
    
    // Set required environment variables for build
    process.env.NODE_ENV = 'production';
    process.env.VITE_BUILD_MODE = 'production';
    process.env.CI = 'true';
    
    // Check if required files exist
    const indexHtmlPath = path.resolve(process.cwd(), 'index.html');
    const viteBuildConfigPath = path.resolve(process.cwd(), 'vite.build.config.ts');
    const entryClientPath = path.resolve(process.cwd(), 'app/entry.client.tsx');
    
    console.log('Checking required files...');
    console.log('index.html path:', indexHtmlPath);
    console.log('vite.build.config.ts path:', viteBuildConfigPath);
    console.log('app/entry.client.tsx path:', entryClientPath);
    console.log('index.html exists:', fs.existsSync(indexHtmlPath));
    console.log('vite.build.config.ts exists:', fs.existsSync(viteBuildConfigPath));
    console.log('app/entry.client.tsx exists:', fs.existsSync(entryClientPath));
    
    if (!fs.existsSync(indexHtmlPath)) {
      throw new Error('index.html not found');
    }
    
    if (!fs.existsSync(viteBuildConfigPath)) {
      throw new Error('vite.build.config.ts not found');
    }
    
    if (!fs.existsSync(entryClientPath)) {
      throw new Error('app/entry.client.tsx not found');
    }
    
    console.log('Starting Vite build...');
    
    // Ensure build directory exists
    const buildDir = path.resolve(process.cwd(), 'build/client');
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
      console.log('Created build directory:', buildDir);
    }
    
    // Build with dedicated configuration file
    const result = await build({
      configFile: viteBuildConfigPath,
      mode: 'production',
      root: process.cwd()
    });
    
    console.log('Build result:', result);
    
    // Verify the build output
    const buildPath = path.resolve(process.cwd(), 'build/client');
    const indexPath = path.resolve(buildPath, 'index.html');
    const assetsDir = path.resolve(buildPath, 'assets');
    
    console.log('Verifying build output...');
    console.log('Build directory exists:', fs.existsSync(buildPath));
    console.log('index.html exists:', fs.existsSync(indexPath));
    console.log('Assets directory exists:', fs.existsSync(assetsDir));
    
    if (!fs.existsSync(buildPath)) {
      throw new Error('Build directory was not created');
    }
    
    if (!fs.existsSync(indexPath)) {
      console.error('❌ index.html was not generated in build output');
      throw new Error('index.html was not generated in build output');
    }
    
    // Check if assets directory exists and has files
    if (!fs.existsSync(assetsDir)) {
      console.warn('⚠️ Assets directory was not created, creating fallback assets...');
      fs.mkdirSync(assetsDir, { recursive: true });
      
      // Create a fallback entry client file
      const fallbackEntryClient = `
        // Fallback entry client - created because Vite build did not generate assets
        console.warn('Using fallback entry client - Vite build did not generate proper assets');
        
        import React from 'react';
        import { createRoot } from 'react-dom/client';
        import Root from '../app/root';
        
        const rootElement = document.getElementById('root');
        if (rootElement) {
          const root = createRoot(rootElement);
          root.render(React.createElement(Root));
        } else {
          console.error('Root element not found');
        }
      `;
      
      const fallbackPath = path.resolve(assetsDir, 'entry.client-fallback.js');
      fs.writeFileSync(fallbackPath, fallbackEntryClient);
      console.log('✅ Created fallback entry client:', fallbackPath);
    } else {
      const assetFiles = fs.readdirSync(assetsDir);
      console.log('Assets directory contents:', assetFiles);
      
      if (assetFiles.length === 0) {
        console.warn('⚠️ Assets directory is empty, creating fallback assets...');
        
        // Create a fallback entry client file
        const fallbackEntryClient = `
          // Fallback entry client - created because Vite build generated empty assets
          console.warn('Using fallback entry client - Vite build generated empty assets');
          
          import React from 'react';
          import { createRoot } from 'react-dom/client';
          import Root from '../app/root';
          
          const rootElement = document.getElementById('root');
          if (rootElement) {
            const root = createRoot(rootElement);
            root.render(React.createElement(Root));
          } else {
            console.error('Root element not found');
          }
        `;
        
        const fallbackPath = path.resolve(assetsDir, 'entry.client-fallback.js');
        fs.writeFileSync(fallbackPath, fallbackEntryClient);
        console.log('✅ Created fallback entry client:', fallbackPath);
      }
    }
    
    // Run the asset reference fixing script
    console.log('Running asset reference fixing script...');
    try {
      const { execSync } = await import('child_process');
      execSync('node scripts/fix-asset-references.js', { stdio: 'inherit' });
      console.log('✅ Asset reference fixing completed');
    } catch (error) {
      console.warn('⚠️ Asset reference fixing failed:', error.message);
    }

    // Run the animation listener patching script
    console.log('Running animation listener patching script...');
    try {
      const { execSync } = await import('child_process');
      execSync('node ../../scripts/patch-animation-listeners.js build/client/assets', { stdio: 'inherit' });
      console.log('✅ Animation listener patching completed');
    } catch (error) {
      console.warn('⚠️ Animation listener patching failed:', error.message);
    }
    
    // Final verification
    console.log('Final verification...');
    const finalAssetsDir = path.resolve(buildPath, 'assets');
    const finalAssetFiles = fs.existsSync(finalAssetsDir) ? fs.readdirSync(finalAssetsDir) : [];
    console.log('Final assets directory contents:', finalAssetFiles);
    
    console.log('✅ Build with fallback completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    console.error('Error details:', error.message);
    
    // Create emergency fallback
    console.log('Creating emergency fallback...');
    try {
      const buildDir = path.resolve(process.cwd(), 'build/client');
      const assetsDir = path.resolve(buildDir, 'assets');
      
      fs.mkdirSync(buildDir, { recursive: true });
      fs.mkdirSync(assetsDir, { recursive: true });
      
      // Copy fallback index.html
      const fallbackIndexPath = path.resolve(process.cwd(), 'fallback-index.html');
      const indexPath = path.resolve(buildDir, 'index.html');
      
      if (fs.existsSync(fallbackIndexPath)) {
        fs.copyFileSync(fallbackIndexPath, indexPath);
        console.log('✅ Copied fallback index.html');
      } else {
        // Create minimal index.html
        const minimalHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PiText Email - Build Error</title>
          </head>
          <body>
            <div id="root">
              <div style="padding: 20px; text-align: center;">
                <h1>Build Error</h1>
                <p>The application failed to build properly. Please check the deployment logs.</p>
              </div>
            </div>
            <script type="module" src="/assets/entry.client-fallback.js"></script>
          </body>
          </html>
        `;
        fs.writeFileSync(indexPath, minimalHtml);
        console.log('✅ Created minimal index.html');
      }
      
      // Create fallback entry client
      const fallbackEntryClient = `
        // Emergency fallback entry client
        console.error('Build failed - using emergency fallback');
        document.getElementById('root').innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Build Error</h1><p>The application failed to build properly. Please check the deployment logs.</p></div>';
      `;
      
      const fallbackPath = path.resolve(assetsDir, 'entry.client-fallback.js');
      fs.writeFileSync(fallbackPath, fallbackEntryClient);
      console.log('✅ Created emergency fallback entry client');
      
    } catch (fallbackError) {
      console.error('❌ Emergency fallback creation failed:', fallbackError.message);
    }
    
    process.exit(1);
  }
}

buildWithFallback(); 