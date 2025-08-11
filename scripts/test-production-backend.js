#!/usr/bin/env node

/**
 * Test Production Backend Configuration
 * This script tests the connection to your production backend
 */

import fetch from 'node-fetch';

const PRODUCTION_API_URL = 'https://mipt.pythonanywhere.com/api';

console.log('🧪 Testing Production Backend Configuration...\n');

console.log('📋 Configuration:');
console.log(`   Production Backend: ${PRODUCTION_API_URL}`);
console.log(`   Environment Variable: ${process.env.VITE_API_URL || 'Not set'}\n`);

// Test basic connectivity
async function testConnectivity() {
  console.log('🔍 Testing basic connectivity...');
  
  try {
    const response = await fetch(`${PRODUCTION_API_URL}/auth/health/`);
    console.log(`✅ Health check: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.text();
      console.log(`📥 Response: ${data}`);
    }
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
  }
}

// Test login endpoint structure
async function testLoginEndpoint() {
  console.log('\n🔍 Testing login endpoint structure...');
  
  const testEndpoints = [
    `${PRODUCTION_API_URL}/auth/login/`,
    `${PRODUCTION_API_URL}/auth/login`,
    `${PRODUCTION_API_URL}/login/`,
    `${PRODUCTION_API_URL}/login`
  ];
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`🔄 Testing: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'testpass'
        })
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 400 || response.status === 401) {
        console.log(`   ✅ Endpoint exists (expected error for invalid credentials)`);
      } else if (response.status === 405) {
        console.log(`   ⚠️ Method not allowed (endpoint exists but doesn't accept POST)`);
      } else if (response.status === 404) {
        console.log(`   ❌ Endpoint not found`);
      } else {
        console.log(`   ℹ️ Unexpected status: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

// Test CORS
async function testCORS() {
  console.log('\n🔍 Testing CORS configuration...');
  
  try {
    const response = await fetch(`${PRODUCTION_API_URL}/auth/login/`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log(`✅ CORS preflight: ${response.status} ${response.statusText}`);
    console.log(`   Access-Control-Allow-Origin: ${response.headers.get('Access-Control-Allow-Origin')}`);
    console.log(`   Access-Control-Allow-Methods: ${response.headers.get('Access-Control-Allow-Methods')}`);
    
  } catch (error) {
    console.log(`❌ CORS test failed: ${error.message}`);
  }
}

// Main test function
async function runTests() {
  try {
    await testConnectivity();
    await testLoginEndpoint();
    await testCORS();
    
    console.log('\n🎯 Testing Complete!');
    console.log('\n📊 Summary:');
    console.log('   - Check the status codes above to identify endpoint mismatches');
    console.log('   - 404 errors indicate wrong endpoint paths');
    console.log('   - 405 errors indicate wrong HTTP methods');
    console.log('   - CORS issues will show in browser console');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

// Run tests
runTests();

