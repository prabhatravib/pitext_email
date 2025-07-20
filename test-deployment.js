#!/usr/bin/env node

/**
 * PiText Email - Deployment Test Script
 * Run this to verify your deployment is working correctly
 */

const https = require('https');

const SERVICE_URL = 'https://pitext-email.onrender.com';

console.log('🧪 Testing PiText Email Single Service Deployment...\n');

function testEndpoint(url, path = '') {
  return new Promise((resolve) => {
    const fullUrl = `${url}${path}`;
    console.log(`📡 Testing: ${fullUrl}`);
    
    https.get(fullUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ SUCCESS (${res.statusCode}): ${fullUrl}`);
          if (path === '/health') {
            try {
              const json = JSON.parse(data);
              console.log(`   Response: ${JSON.stringify(json)}`);
            } catch (e) {
              console.log(`   Response: ${data.substring(0, 100)}...`);
            }
          }
        } else {
          console.log(`❌ FAILED (${res.statusCode}): ${fullUrl}`);
        }
        console.log('');
        resolve(res.statusCode === 200);
      });
    }).on('error', (err) => {
      console.log(`❌ ERROR: ${fullUrl}`);
      console.log(`   ${err.message}\n`);
      resolve(false);
    });
  });
}

async function runTests() {
  const results = {
    health: await testEndpoint(SERVICE_URL, '/health'),
    frontend: await testEndpoint(SERVICE_URL),
    apiTest: await testEndpoint(SERVICE_URL, '/api/folders'),
  };
  
  console.log('📊 Test Results Summary:');
  console.log('========================');
  
  if (results.health) {
    console.log('✅ Health check passed');
    console.log('   - Server is running');
    console.log('   - All-in-one mode active');
  } else {
    console.log('❌ Health check failed');
    console.log('   - Check if service is deployed');
    console.log('   - Verify PORT is set to 10000');
  }
  
  if (results.frontend) {
    console.log('✅ Frontend is accessible');
  } else {
    console.log('❌ Frontend is not accessible');
    console.log('   - Check if build completed');
    console.log('   - Check Render logs for errors');
  }
  
  if (results.apiTest) {
    console.log('✅ API endpoints working');
  } else {
    console.log('⚠️  API endpoints not responding');
    console.log('   - This is normal during build');
  }
  
  if (results.health && results.frontend) {
    console.log('\n🎉 Deployment successful! Next steps:');
    console.log('   1. Visit: ' + SERVICE_URL);
    console.log('   2. Check the welcome email in inbox');
    console.log('   3. Try composing and sending emails');
    console.log('   4. (Optional) Set up Gmail OAuth for real emails');
  } else {
    console.log('\n⚠️  Deployment needs attention.');
    console.log('   - Wait 5-10 minutes if just deployed');
    console.log('   - Check Render logs for build errors');
    console.log('   - Ensure environment variables are set');
  }
}

runTests().catch(console.error); 