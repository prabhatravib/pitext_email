#!/usr/bin/env node

/**
 * Test script to verify CORS and API endpoints are working
 * Run this after deployment to check if the fixes work
 */

import https from 'https';

// Test CORS configuration
async function testCORS() {
  const baseUrl = 'https://pitext-email.onrender.com';
  
  console.log('🧪 Testing CORS configuration...');
  
  // Test 1: Check if the server responds to OPTIONS requests
  try {
    const optionsResponse = await makeRequest(`${baseUrl}/api/auth/use-session`, 'OPTIONS');
    console.log('✅ OPTIONS request successful:', optionsResponse.status);
    console.log('📋 CORS Headers:', {
      'Access-Control-Allow-Origin': optionsResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': optionsResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': optionsResponse.headers['access-control-allow-headers'],
      'Access-Control-Allow-Credentials': optionsResponse.headers['access-control-allow-credentials'],
    });
  } catch (error) {
    console.log('❌ OPTIONS request failed:', error.message);
  }
  
  // Test 2: Check if auth endpoint exists
  try {
    const authResponse = await makeRequest(`${baseUrl}/api/auth/use-session`, 'GET');
    console.log('✅ Auth endpoint accessible:', authResponse.status);
  } catch (error) {
    console.log('❌ Auth endpoint failed:', error.message);
  }
  
  // Test 3: Check if autumn endpoint exists
  try {
    const autumnResponse = await makeRequest(`${baseUrl}/api/autumn/customers`, 'GET');
    console.log('✅ Autumn endpoint accessible:', autumnResponse.status);
  } catch (error) {
    console.log('❌ Autumn endpoint failed:', error.message);
  }
  
  // Test 4: Check health endpoint
  try {
    const healthResponse = await makeRequest(`${baseUrl}/health`, 'GET');
    console.log('✅ Health endpoint accessible:', healthResponse.status);
    console.log('📋 Health response:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health endpoint failed:', error.message);
  }
}

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Origin': 'https://pitext-email.onrender.com',
        'Access-Control-Request-Method': method,
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      }
    };
    
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Run the test
testCORS().catch(console.error);