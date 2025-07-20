#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function debugBuild() {
  console.log('🔍 Debugging build process...');
  console.log('📁 Current directory:', process.cwd());
  console.log('📁 Script directory:', __dirname);
  
  // Check if we're in the right directory
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found in current directory');
    console.log('📄 Available files:', fs.readdirSync(process.cwd()));
    return;
  }
  
  console.log('✅ Found package.json');
  
  // Check if apps/mail exists
  const mailAppPath = path.join(process.cwd(), 'apps/mail');
  if (!fs.existsSync(mailAppPath)) {
    console.log('❌ apps/mail directory not found');
    console.log('📄 Available directories:', fs.readdirSync(process.cwd()));
    return;
  }
  
  console.log('✅ Found apps/mail directory');
  
  // Check mail app package.json
  const mailPackageJsonPath = path.join(mailAppPath, 'package.json');
  if (!fs.existsSync(mailPackageJsonPath)) {
    console.log('❌ apps/mail/package.json not found');
    return;
  }
  
  console.log('✅ Found apps/mail/package.json');
  
  // Check if build script exists
  const buildScriptPath = path.join(mailAppPath, 'build-client-only.js');
  if (!fs.existsSync(buildScriptPath)) {
    console.log('❌ build-client-only.js not found');
    console.log('📄 Available files in apps/mail:', fs.readdirSync(mailAppPath));
    return;
  }
  
  console.log('✅ Found build-client-only.js');
  
  // Check if index.html exists
  const indexHtmlPath = path.join(mailAppPath, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.log('❌ index.html not found');
    return;
  }
  
  console.log('✅ Found index.html');
  
  // Check if vite.client.config.ts exists
  const viteConfigPath = path.join(mailAppPath, 'vite.client.config.ts');
  if (!fs.existsSync(viteConfigPath)) {
    console.log('❌ vite.client.config.ts not found');
    return;
  }
  
  console.log('✅ Found vite.client.config.ts');
  
  // Try to run the build
  console.log('\n🔨 Attempting build...');
  try {
    process.chdir(mailAppPath);
    console.log('📁 Changed to mail directory:', process.cwd());
    
    execSync('pnpm run build', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        CI: 'true'
      }
    });
    
    console.log('✅ Build completed successfully!');
    
    // Check build output
    const buildPath = path.join(mailAppPath, 'build/client');
    if (fs.existsSync(buildPath)) {
      const files = fs.readdirSync(buildPath);
      console.log('📄 Build files:', files.slice(0, 10));
      
      const indexPath = path.join(buildPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        const stats = fs.statSync(indexPath);
        console.log(`✅ index.html exists (${stats.size} bytes)`);
      } else {
        console.log('❌ index.html missing in build');
      }
    } else {
      console.log('❌ Build directory not found');
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
  }
}

debugBuild(); 