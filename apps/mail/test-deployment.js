#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing deployment fixes...');

// Test 1: Check if build directory exists
const buildDir = path.join(__dirname, 'build/client');
console.log('🔍 Test 1: Build directory exists');
if (fs.existsSync(buildDir)) {
  console.log('✅ Build directory exists');
} else {
  console.log('❌ Build directory missing');
  process.exit(1);
}

// Test 2: Check if index.html exists
const indexPath = path.join(buildDir, 'index.html');
console.log('🔍 Test 2: index.html exists');
if (fs.existsSync(indexPath)) {
  console.log('✅ index.html exists');
} else {
  console.log('❌ index.html missing');
  process.exit(1);
}

// Test 3: Check if assets directory exists
const assetsDir = path.join(buildDir, 'assets');
console.log('🔍 Test 3: Assets directory exists');
if (fs.existsSync(assetsDir)) {
  console.log('✅ Assets directory exists');
} else {
  console.log('❌ Assets directory missing');
  process.exit(1);
}

// Test 4: Check if entry client file exists
console.log('🔍 Test 4: Entry client file exists');
const assetFiles = fs.readdirSync(assetsDir);
const entryFiles = assetFiles.filter(file => 
  (file.startsWith('entry.client-') || file.startsWith('index-')) && file.endsWith('.js')
);

if (entryFiles.length > 0) {
  console.log(`✅ Entry client file found: ${entryFiles[0]}`);
} else {
  console.log('❌ No entry client file found');
  console.log('Available files:', assetFiles);
  process.exit(1);
}

// Test 5: Check if index.html references the correct asset
console.log('🔍 Test 5: index.html references correct asset');
const html = fs.readFileSync(indexPath, 'utf8');
const entryFile = entryFiles[0];
const expectedReference = `/assets/${entryFile}`;

if (html.includes(expectedReference)) {
  console.log('✅ index.html references correct asset');
} else {
  console.log('❌ index.html does not reference correct asset');
  console.log('Expected reference:', expectedReference);
  console.log('HTML preview:', html.substring(0, 200));
  process.exit(1);
}

// Test 6: Check if favicon.ico exists
console.log('🔍 Test 6: favicon.ico exists');
const faviconPaths = [
  path.join(__dirname, 'public', 'favicon.ico'),
  path.join(__dirname, 'favicon.ico')
];

let faviconExists = false;
for (const faviconPath of faviconPaths) {
  if (fs.existsSync(faviconPath)) {
    console.log(`✅ favicon.ico exists at: ${faviconPath}`);
    faviconExists = true;
    break;
  }
}

if (!faviconExists) {
  console.log('❌ favicon.ico not found');
}

// Test 7: Check if manifest.json exists
console.log('🔍 Test 7: manifest.json exists');
const manifestPaths = [
  path.join(__dirname, 'public', 'manifest.json'),
  path.join(__dirname, 'manifest.json')
];

let manifestExists = false;
for (const manifestPath of manifestPaths) {
  if (fs.existsSync(manifestPath)) {
    console.log(`✅ manifest.json exists at: ${manifestPath}`);
    manifestExists = true;
    break;
  }
}

if (!manifestExists) {
  console.log('❌ manifest.json not found');
}

console.log('🎉 All deployment tests completed!');
console.log('📋 Summary:');
console.log(`  - Build directory: ${fs.existsSync(buildDir) ? '✅' : '❌'}`);
console.log(`  - index.html: ${fs.existsSync(indexPath) ? '✅' : '❌'}`);
console.log(`  - Assets directory: ${fs.existsSync(assetsDir) ? '✅' : '❌'}`);
console.log(`  - Entry client file: ${entryFiles.length > 0 ? '✅' : '❌'}`);
console.log(`  - Asset reference: ${html.includes(expectedReference) ? '✅' : '❌'}`);
console.log(`  - favicon.ico: ${faviconExists ? '✅' : '❌'}`);
console.log(`  - manifest.json: ${manifestExists ? '✅' : '❌'}`); 