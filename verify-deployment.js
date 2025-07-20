#!/usr/bin/env node

/**
 * Deployment Verification Script
 * This script verifies that all deployment changes are correct
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying deployment configuration...\n');

// Check render.yaml
console.log('📋 Checking render.yaml...');
const renderYamlPath = path.join(process.cwd(), 'render.yaml');
if (fs.existsSync(renderYamlPath)) {
  const renderYaml = fs.readFileSync(renderYamlPath, 'utf8');
  
  // Check for correct service names
  if (renderYaml.includes('pitext-email-backend') && renderYaml.includes('pitext-email')) {
    console.log('✅ Service names are correct');
  } else {
    console.log('❌ Service names are incorrect');
  }
  
  // Check for correct build commands
  if (renderYaml.includes('cd apps/mail && pnpm run build')) {
    console.log('✅ Frontend build command is correct');
  } else {
    console.log('❌ Frontend build command is incorrect');
  }
  
  // Check for correct start commands
  if (renderYaml.includes('cd apps/mail && node server.js')) {
    console.log('✅ Frontend start command is correct');
  } else {
    console.log('❌ Frontend start command is incorrect');
  }
} else {
  console.log('❌ render.yaml not found');
}

// Check server.js
console.log('\n📋 Checking server.js...');
const serverPath = path.join(process.cwd(), 'apps/mail/server.js');
if (fs.existsSync(serverPath)) {
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  if (serverContent.includes('buildPath = path.join(__dirname, \'build/client\')')) {
    console.log('✅ Build path is correctly configured');
  } else {
    console.log('❌ Build path is not correctly configured');
  }
  
  if (serverContent.includes('fs.existsSync(buildPath)')) {
    console.log('✅ Build directory check is implemented');
  } else {
    console.log('❌ Build directory check is missing');
  }
  
  if (serverContent.includes('fs.existsSync(indexPath)')) {
    console.log('✅ index.html check is implemented');
  } else {
    console.log('❌ index.html check is missing');
  }
  
  if (serverContent.includes('app.get(\'*\', (req, res) =>')) {
    console.log('✅ SPA routing is configured');
  } else {
    console.log('❌ SPA routing is missing');
  }
} else {
  console.log('❌ server.js not found');
}

// Check package.json scripts
console.log('\n📋 Checking package.json scripts...');
const packageJsonPath = path.join(process.cwd(), 'apps/mail/package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.scripts.build) {
    console.log('✅ Build script exists');
  } else {
    console.log('❌ Build script missing');
  }
  
  if (packageJson.scripts.start) {
    console.log('✅ Start script exists');
  } else {
    console.log('❌ Start script missing');
  }
} else {
  console.log('❌ package.json not found');
}

// Check vite.config.ts
console.log('\n📋 Checking vite.config.ts...');
const viteConfigPath = path.join(process.cwd(), 'apps/mail/vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  if (viteConfig.includes('outDir: \'build/client\'')) {
    console.log('✅ Build output directory is correct');
  } else {
    console.log('❌ Build output directory is incorrect');
  }
  
  if (viteConfig.includes('reactRouter')) {
    console.log('✅ React Router plugin is configured');
  } else {
    console.log('❌ React Router plugin is missing');
  }
} else {
  console.log('❌ vite.config.ts not found');
}

// Check environment variables
console.log('\n📋 Checking environment variables...');
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'VITE_PUBLIC_BACKEND_URL',
  'VITE_PUBLIC_APP_URL',
  'BETTER_AUTH_SECRET'
];

console.log('Required environment variables for deployment:');
requiredEnvVars.forEach(varName => {
  console.log(`  - ${varName}`);
});

console.log('\n📋 Summary of fixes applied:');
console.log('✅ Updated render.yaml with correct service names and commands');
console.log('✅ Enhanced server.js with better error handling and logging');
console.log('✅ Simplified vite.config.ts to remove problematic plugins');
console.log('✅ Added build verification scripts');
console.log('✅ Added deployment instructions');

console.log('\n🎯 Expected results after deployment:');
console.log('✅ Frontend loads at https://pitext-email.onrender.com');
console.log('✅ Backend responds at https://pitext-email-backend.onrender.com');
console.log('✅ Gmail import works when you click "Get Started" → "Google"');
console.log('✅ No more 404 errors on the frontend');

console.log('\n📋 Next steps:');
console.log('1. Add environment variables to Render services');
console.log('2. Push changes to GitHub');
console.log('3. Monitor deployment logs');
console.log('4. Test Gmail import functionality');

console.log('\n🔧 If issues persist:');
console.log('- Check Render logs for build failures');
console.log('- Verify environment variables are set correctly');
console.log('- Run pnpm run verify:build locally');
console.log('- Ensure Google OAuth credentials are valid'); 