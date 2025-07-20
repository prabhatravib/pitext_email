#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing build process...\n');

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('pnpm install --frozen-lockfile', { stdio: 'inherit' });
  
  // Build frontend
  console.log('🔨 Building frontend...');
  execSync('cd apps/mail && pnpm run build', { stdio: 'inherit' });
  
  // Check if build was successful
  const buildPath = path.join(__dirname, 'apps/mail/build/client');
  const indexPath = path.join(buildPath, 'index.html');
  
  if (!fs.existsSync(buildPath)) {
    throw new Error('Build directory not created');
  }
  
  if (!fs.existsSync(indexPath)) {
    throw new Error('index.html not found in build output');
  }
  
  console.log('✅ Build test completed successfully!');
  console.log(`📁 Build output: ${buildPath}`);
  console.log(`📄 index.html: ${indexPath}`);
  
  // List build contents
  console.log('\n📋 Build contents:');
  const buildFiles = fs.readdirSync(buildPath);
  buildFiles.slice(0, 10).forEach(file => {
    const filePath = path.join(buildPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      console.log(`📁 ${file}/`);
    } else {
      console.log(`📄 ${file}`);
    }
  });
  
  if (buildFiles.length > 10) {
    console.log(`... and ${buildFiles.length - 10} more files`);
  }
  
  console.log('\n🎉 Build test passed! Your deployment should work correctly.');
  
} catch (error) {
  console.error('❌ Build test failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
} 