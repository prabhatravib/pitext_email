#!/usr/bin/env node

/**
 * Gmail Import Setup Script
 * This script helps you configure the Gmail import functionality
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🚀 PiText Email - Gmail Import Setup\n');
  
  console.log('📋 Prerequisites:');
  console.log('1. You need a Google Cloud Console project');
  console.log('2. Gmail API and People API enabled');
  console.log('3. OAuth 2.0 credentials created\n');
  
  const hasGoogleProject = await question('Do you have a Google Cloud Console project set up? (y/n): ');
  
  if (hasGoogleProject.toLowerCase() !== 'y') {
    console.log('\n📖 Please follow these steps first:');
    console.log('1. Go to https://console.cloud.google.com');
    console.log('2. Create a new project or select existing one');
    console.log('3. Enable Gmail API: https://console.cloud.google.com/apis/library/gmail.googleapis.com');
    console.log('4. Enable People API: https://console.cloud.google.com/apis/library/people.googleapis.com');
    console.log('5. Create OAuth 2.0 credentials\n');
    return;
  }
  
  console.log('\n🔑 Please provide your Google OAuth credentials:');
  
  const clientId = await question('Google Client ID: ');
  const clientSecret = await question('Google Client Secret: ');
  
  if (!clientId || !clientSecret) {
    console.log('❌ Client ID and Client Secret are required!');
    return;
  }
  
  console.log('\n🌐 Please provide your deployment URLs:');
  
  const backendUrl = await question('Backend URL (e.g., https://pitext-email-backend.onrender.com): ');
  const frontendUrl = await question('Frontend URL (e.g., https://pitext-email.onrender.com): ');
  
  if (!backendUrl || !frontendUrl) {
    console.log('❌ Both backend and frontend URLs are required!');
    return;
  }
  
  // Generate a random secret for Better Auth
  const betterAuthSecret = require('crypto').randomBytes(32).toString('hex');
  
  // Create .env file content
  const envContent = `# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zerodotemail

# Google OAuth (Required for Gmail Import)
GOOGLE_CLIENT_ID=${clientId}
GOOGLE_CLIENT_SECRET=${clientSecret}

# Better Auth
BETTER_AUTH_SECRET=${betterAuthSecret}
BETTER_AUTH_URL=${backendUrl}

# App URLs
VITE_PUBLIC_BACKEND_URL=${backendUrl}
VITE_PUBLIC_APP_URL=${frontendUrl}

# Other required variables
NODE_ENV=production
COOKIE_DOMAIN=${new URL(frontendUrl).hostname}

# Optional: Database for production (if using external DB)
# DATABASE_URL=your_production_database_url
`;

  // Write .env file
  const envPath = path.join(process.cwd(), '.env');
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Environment file created successfully!');
  console.log(`📁 Location: ${envPath}`);
  
  console.log('\n📋 Next steps:');
  console.log('1. Update your Google OAuth redirect URIs:');
  console.log(`   - Development: http://localhost:8787/api/auth/callback/google`);
  console.log(`   - Production: ${backendUrl}/api/auth/callback/google`);
  console.log('\n2. Deploy to Render:');
  console.log('   - Push your code to GitHub');
  console.log('   - Connect your repo to Render');
  console.log('   - Add the environment variables to your Render services');
  console.log('\n3. Test Gmail Import:');
  console.log(`   - Visit ${frontendUrl}`);
  console.log('   - Click "Get Started" and sign in with Google');
  console.log('   - Your Gmail emails should be imported!');
  
  console.log('\n🔧 Troubleshooting:');
  console.log('- If you get OAuth errors, check your redirect URIs');
  console.log('- If emails don\'t load, verify your Google API permissions');
  console.log('- Check Render logs for any deployment issues');
  
  rl.close();
}

main().catch(console.error); 