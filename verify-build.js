#!/usr/bin/env node

/**
 * Build Verification Script
 * This script helps verify that the frontend build process works correctly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verifying frontend build process...\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found. Please run this script from the project root.');
  process.exit(1);
}

console.log('✅ Found package.json');

// Check if apps/mail directory exists
const mailAppPath = path.join(process.cwd(), 'apps/mail');
if (!fs.existsSync(mailAppPath)) {
  console.error('❌ apps/mail directory not found.');
  process.exit(1);
}

console.log('✅ Found apps/mail directory');

// Check if package.json exists in mail app
const mailPackageJsonPath = path.join(mailAppPath, 'package.json');
if (!fs.existsSync(mailPackageJsonPath)) {
  console.error('❌ apps/mail/package.json not found.');
  process.exit(1);
}

console.log('✅ Found apps/mail/package.json');

// Check if vite.config.ts exists
const viteConfigPath = path.join(mailAppPath, 'vite.config.ts');
if (!fs.existsSync(viteConfigPath)) {
  console.error('❌ apps/mail/vite.config.ts not found.');
  process.exit(1);
}

console.log('✅ Found apps/mail/vite.config.ts');

// Check if server.js exists
const serverPath = path.join(mailAppPath, 'server.js');
if (!fs.existsSync(serverPath)) {
  console.error('❌ apps/mail/server.js not found.');
  process.exit(1);
}

console.log('✅ Found apps/mail/server.js');

console.log('\n🚀 Attempting to build frontend...\n');

try {
  // Change to mail app directory
  process.chdir(mailAppPath);
  
  // Install dependencies if node_modules doesn't exist
  if (!fs.existsSync(path.join(mailAppPath, 'node_modules'))) {
    console.log('📦 Installing dependencies...');
    execSync('pnpm install', { stdio: 'inherit' });
  }
  
  // Run the build
  console.log('🔨 Building frontend...');
  execSync('pnpm run build', { stdio: 'inherit' });
  
  // Check if build was successful
  const buildPath = path.join(mailAppPath, 'build/client');
  const indexPath = path.join(buildPath, 'index.html');
  
  if (!fs.existsSync(buildPath)) {
    console.error('❌ Build directory not created.');
    process.exit(1);
  }
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found in build output.');
    console.log('Available files in build/client:', fs.readdirSync(buildPath));
    process.exit(1);
  }
  
  console.log('✅ Build completed successfully!');
  console.log(`📁 Build output: ${buildPath}`);
  console.log(`📄 index.html: ${indexPath}`);
  
  // List build contents
  console.log('\n📋 Build contents:');
  const buildFiles = fs.readdirSync(buildPath);
  buildFiles.forEach(file => {
    const filePath = path.join(buildPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      console.log(`📁 ${file}/`);
    } else {
      console.log(`📄 ${file}`);
    }
  });
  
  console.log('\n🎉 Build verification completed successfully!');
  console.log('✅ Your frontend should deploy correctly now.');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.log('\n🔧 Troubleshooting tips:');
  console.log('1. Make sure all dependencies are installed: pnpm install');
  console.log('2. Check for TypeScript errors: pnpm run lint');
  console.log('3. Verify environment variables are set correctly');
  console.log('4. Check the build logs for specific errors');
  process.exit(1);
} 