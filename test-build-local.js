#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function testBuild() {
  try {
    console.log('🧪 Testing build process locally...');
    
    // Change to mail app directory
    const mailAppPath = path.join(__dirname, 'apps/mail');
    process.chdir(mailAppPath);
    console.log('📁 Changed to directory:', process.cwd());
    
    // Run the build
    console.log('🔨 Running build...');
    execSync('pnpm run build', { stdio: 'inherit' });
    
    // Check build output
    const buildPath = path.join(mailAppPath, 'build/client');
    console.log('📁 Build path:', buildPath);
    
    if (fs.existsSync(buildPath)) {
      const files = fs.readdirSync(buildPath);
      console.log('✅ Build successful! Files in build:', files);
      
      // Check for critical files
      const criticalFiles = ['index.html'];
      for (const file of criticalFiles) {
        const filePath = path.join(buildPath, file);
        if (fs.existsSync(filePath)) {
          console.log(`✅ ${file} exists`);
        } else {
          console.log(`❌ ${file} missing`);
        }
      }
    } else {
      console.log('❌ Build directory not found');
    }
    
  } catch (error) {
    console.error('❌ Build test failed:', error);
    process.exit(1);
  }
}

testBuild(); 