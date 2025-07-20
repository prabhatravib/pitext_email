#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Debugging build process...\n');

// Check current directory
console.log('📁 Current directory:', process.cwd());

// Check if we're in the right place
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('✅ Found root package.json');
} else {
  console.log('❌ Root package.json not found');
}

// Check mail app directory
const mailAppPath = path.join(process.cwd(), 'apps/mail');
if (fs.existsSync(mailAppPath)) {
  console.log('✅ Found mail app directory');
} else {
  console.log('❌ Mail app directory not found');
}

// Check build script
const buildScriptPath = path.join(mailAppPath, 'build-client-only.js');
if (fs.existsSync(buildScriptPath)) {
  console.log('✅ Found build-client-only.js');
} else {
  console.log('❌ build-client-only.js not found');
}

// Check index.html
const indexHtmlPath = path.join(mailAppPath, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  console.log('✅ Found index.html');
} else {
  console.log('❌ index.html not found');
}

// Check vite config
const viteConfigPath = path.join(mailAppPath, 'vite.client.config.ts');
if (fs.existsSync(viteConfigPath)) {
  console.log('✅ Found vite.client.config.ts');
} else {
  console.log('❌ vite.client.config.ts not found');
}

// Check if build directory exists
const buildPath = path.join(mailAppPath, 'build/client');
if (fs.existsSync(buildPath)) {
  console.log('✅ Build directory exists');
  
  // List build contents
  const buildFiles = fs.readdirSync(buildPath);
  console.log('📋 Build contents:', buildFiles.slice(0, 10));
  
  // Check for index.html
  const indexPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html exists in build');
  } else {
    console.log('❌ index.html missing from build');
  }
} else {
  console.log('❌ Build directory does not exist');
}

console.log('\n🎯 Build verification complete!'); 