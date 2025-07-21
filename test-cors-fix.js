#!/usr/bin/env node

/**
 * Test script to verify CORS and API endpoints are working
 * Run this after deployment to check if the fixes work
 */

const BASE_URL = process.env.TEST_URL || 'https://pitext-email.onrender.com';

async function testEndpoint(endpoint, method = 'GET', body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://pitext-email.onrender.com'
    },
    credentials: 'include'
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    
    return { success: true, status: response.status, data };
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing CORS and API endpoints...\n');
  
  // Test CORS preflight
  console.log('1. Testing CORS preflight...');
  await testEndpoint('/api/auth/session', 'OPTIONS');
  
  // Test auth endpoints
  console.log('\n2. Testing auth endpoints...');
  await testEndpoint('/api/auth/session');
  await testEndpoint('/api/auth/use-session');
  await testEndpoint('/api/auth/providers');
  
  // Test tRPC endpoints
  console.log('\n3. Testing tRPC endpoints...');
  await testEndpoint('/api/trpc/settings.get');
  await testEndpoint('/api/trpc/mail.count');
  await testEndpoint('/api/trpc/categories.defaults');
  
  // Test Autumn endpoints
  console.log('\n4. Testing Autumn endpoints...');
  await testEndpoint('/api/autumn/customers');
  
  // Test health endpoint
  console.log('\n5. Testing health endpoint...');
  await testEndpoint('/health');
  
  console.log('\n✅ All tests completed!');
}

runTests().catch(console.error);