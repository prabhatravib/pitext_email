#!/usr/bin/env node

import { execSync } from 'child_process';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function testBuild() {
  try {
    console.log('🧪 Testing React Router build...');
    console.log('Current directory:', process.cwd());
    console.log('Script directory:', __dirname);
    
    // Set environment variables
    process.env.NODE_ENV = 'production';
    process.env.CI = 'true';
    
    // Check if required files exist
    const indexHtmlPath = resolve(process.cwd(), 'index.html');
    const reactRouterConfigPath = resolve(process.cwd(), 'react-router.config.ts');
    
    console.log('Checking required files...');
    console.log('index.html exists:', fs.existsSync(indexHtmlPath));
    console.log('react-router.config.ts exists:', fs.existsSync(reactRouterConfigPath));
    
    if (!fs.existsSync(indexHtmlPath)) {
      throw new Error('index.html not found');
    }
    
    if (!fs.existsSync(reactRouterConfigPath)) {
      throw new Error('react-router.config.ts not found');
    }
    
    // Clean previous build
    const buildDir = resolve(process.cwd(), 'build');
    if (fs.existsSync(buildDir)) {
      console.log('Cleaning previous build...');
      fs.rmSync(buildDir, { recursive: true, force: true });
    }
    
    // Run React Router build
    console.log('Running React Router build...');
    execSync('npx react-router build', { 
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env }
    });
    
    // Verify build output
    const clientBuildPath = resolve(process.cwd(), 'build/client');
    const indexPath = resolve(clientBuildPath, 'index.html');
    
    console.log('Verifying build output...');
    console.log('Build directory exists:', fs.existsSync(clientBuildPath));
    console.log('index.html exists:', fs.existsSync(indexPath));
    
    if (!fs.existsSync(clientBuildPath)) {
      throw new Error('Build directory was not created');
    }
    
    if (!fs.existsSync(indexPath)) {
      console.error('❌ index.html was not generated');
      if (fs.existsSync(clientBuildPath)) {
        const buildFiles = fs.readdirSync(clientBuildPath);
        console.error('Available files:', buildFiles);
      }
      throw new Error('index.html was not generated');
    }
    
    // Read and verify index.html content
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    console.log('index.html content length:', indexContent.length);
    console.log('index.html starts with DOCTYPE:', indexContent.startsWith('<!DOCTYPE'));
    
    if (fs.existsSync(clientBuildPath)) {
      const buildFiles = fs.readdirSync(clientBuildPath);
      console.log('Build files:', buildFiles.slice(0, 10));
    }
    
    console.log('✅ React Router build test completed successfully!');
  } catch (error) {
    console.error('❌ Build test failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

testBuild(); 