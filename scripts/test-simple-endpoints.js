#!/usr/bin/env node

/**
 * Simple Endpoint Test Script
 * Tests basic backend connectivity and finds working endpoints
 */

const API_BASE = 'https://mipt.pythonanywhere.com/api';

// Test basic endpoints that should exist
const testEndpoints = [
  '/auth/login/',
  '/auth/register/',
  '/auth/refresh/',
  '/reports/daily/',
  '/reports/weekly/',
  '/users/profile/',
  '/companies/',
  '/ai/enhance/',
  '/exporter/export/',
  '/billing/balance/',
  '/billing/transactions/',
  '/billing/staff/transactions/',
  '/billing/token-usage/',
  '/billing/dashboard/'
];

async function testEndpoint(endpoint) {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    console.log(`🔍 Testing: GET ${endpoint}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      console.log(`   ✅ Working endpoint`);
      return { endpoint, status: response.status, working: true };
    } else if (response.status === 401) {
      console.log(`   🔐 Requires authentication`);
      return { endpoint, status: response.status, working: true, auth: true };
    } else if (response.status === 404) {
      console.log(`   ❌ Endpoint not found`);
      return { endpoint, status: response.status, working: false, error: 'Not Found' };
    } else if (response.status === 500) {
      console.log(`   💥 Server error`);
      return { endpoint, status: response.status, working: false, error: 'Server Error' };
    } else {
      console.log(`   ⚠️  Unexpected status`);
      return { endpoint, status: response.status, working: false, error: 'Unexpected Status' };
    }
  } catch (error) {
    console.log(`   💥 Network Error: ${error.message}`);
    return { endpoint, status: 'ERROR', working: false, error: error.message };
  }
}

async function runSimpleTests() {
  console.log('🚀 Testing Basic Backend Connectivity...');
  console.log(`📍 API Base: ${API_BASE}`);
  console.log('=' .repeat(60));

  const results = [];
  
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Endpoint Test Summary:');
  console.log('=' .repeat(60));
  
  const working = results.filter(r => r.working).length;
  const authRequired = results.filter(r => r.auth).length;
  const notFound = results.filter(r => r.status === 404).length;
  const serverErrors = results.filter(r => r.status === 500).length;
  
  console.log(`✅ Working endpoints: ${working}`);
  console.log(`🔐 Auth required: ${authRequired}`);
  console.log(`❌ Not found: ${notFound}`);
  console.log(`💥 Server errors: ${serverErrors}`);
  
  console.log('\n📋 Detailed Results:');
  results.forEach(result => {
    const status = result.working ? '✅' : '❌';
    const details = result.auth ? ' (Auth Required)' : '';
    console.log(`${status} ${result.endpoint}: ${result.status}${details}`);
  });
  
  if (working === 0) {
    console.log('\n⚠️  No working endpoints found. Backend may be down or endpoints are incorrect.');
  } else {
    console.log(`\n🎉 Found ${working} working endpoints!`);
  }
}

runSimpleTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});

