#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying build output...');

const buildDir = path.join(__dirname, 'build/client');
const assetsDir = path.join(buildDir, 'assets');
const indexPath = path.join(buildDir, 'index.html');

console.log('📁 Build directory:', buildDir);
console.log('📁 Assets directory:', assetsDir);
console.log('📄 Index file:', indexPath);

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory does not exist');
  process.exit(1);
}

// List build directory contents
console.log('\n📁 Build directory contents:');
try {
  const buildContents = fs.readdirSync(buildDir);
  console.log(buildContents);
} catch (e) {
  console.error('Could not read build directory:', e.message);
  process.exit(1);
}

// Check if assets directory exists
if (!fs.existsSync(assetsDir)) {
  console.error('\n❌ Assets directory does not exist');
  console.log('This means the build process did not create the expected file structure.');
  process.exit(1);
}

// List assets directory contents
console.log('\n📁 Assets directory contents:');
try {
  const assetContents = fs.readdirSync(assetsDir);
  console.log(assetContents);
  
  // Check for JavaScript files
  const jsFiles = assetContents.filter(file => file.endsWith('.js'));
  console.log('\n📄 JavaScript files found:', jsFiles);
  
  // Check for CSS files
  const cssFiles = assetContents.filter(file => file.endsWith('.css'));
  console.log('📄 CSS files found:', cssFiles);
  
} catch (e) {
  console.error('Could not read assets directory:', e.message);
  process.exit(1);
}

// Check if index.html exists
if (!fs.existsSync(indexPath)) {
  console.error('\n❌ index.html does not exist');
  process.exit(1);
}

// Read and analyze index.html
console.log('\n📄 Analyzing index.html...');
try {
  const html = fs.readFileSync(indexPath, 'utf8');
  console.log('HTML length:', html.length);
  
  // Check for script tags
  const scriptMatches = html.match(/<script[^>]*src="([^"]*)"[^>]*>/g);
  if (scriptMatches) {
    console.log('\n📄 Script tags found:');
    scriptMatches.forEach(match => {
      const srcMatch = match.match(/src="([^"]*)"/);
      if (srcMatch) {
        console.log('  -', srcMatch[1]);
      }
    });
  }
  
  // Check for the specific entry client reference
  if (html.includes('/app/entry.client.tsx')) {
    console.log('\n⚠️  HTML still contains /app/entry.client.tsx reference');
    console.log('This should be updated by the fix-asset-references.js script');
  } else {
    console.log('\n✅ HTML does not contain /app/entry.client.tsx reference');
  }
  
} catch (e) {
  console.error('Could not read index.html:', e.message);
  process.exit(1);
}

console.log('\n✅ Build verification completed'); 