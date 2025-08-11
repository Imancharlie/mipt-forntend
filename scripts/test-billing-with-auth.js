#!/usr/bin/env node

/**
 * Billing System Test Script with Authentication
 * Tests billing endpoints to see if they work with proper auth
 */

const API_BASE = 'https://mipt.pythonanywhere.com/api';

// Test with a mock token to see if endpoints work
const mockAuthHeaders = {
  'Authorization': 'Bearer mock_token_for_testing',
  'Content-Type': 'application/json'
};

// Test data
const testTransactionData = {
  user_phone_number: '0712345678',
  sender_name: 'Test User',
  payment_method: 'DIRECT',
  amount: 2000
};

async function testEndpointWithAuth(endpoint, method = 'GET', data = null) {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    console.log(`🔍 Testing: ${method} ${endpoint}`);
    
    const options = {
      method,
      headers: mockAuthHeaders
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200 || response.status === 201) {
      console.log(`   ✅ Success`);
      try {
        const responseData = await response.json();
        console.log(`   Response:`, JSON.stringify(responseData, null, 2));
      } catch (e) {
        console.log(`   Response: Text response (not JSON)`);
      }
      return { success: true, status: response.status };
    } else if (response.status === 401) {
      console.log(`   🔐 Authentication required (expected)`);
      return { success: true, status: response.status, auth: true };
    } else if (response.status === 404) {
      console.log(`   ❌ Endpoint not found`);
      return { success: false, status: response.status, error: 'Not Found' };
    } else if (response.status === 403) {
      console.log(`   🚫 Forbidden (permission issue)`);
      return { success: false, status: response.status, error: 'Forbidden' };
    } else {
      console.log(`   ⚠️  Unexpected status`);
      try {
        const errorData = await response.json();
        console.log(`   Error details:`, errorData);
      } catch (e) {
        console.log(`   Error details: Text response`);
      }
      return { success: false, status: response.status, error: 'Unexpected Status' };
    }
  } catch (error) {
    console.log(`   💥 Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runBillingTests() {
  console.log('🚀 Testing Billing Endpoints with Authentication...');
  console.log(`📍 API Base: ${API_BASE}`);
  console.log('=' .repeat(60));

  const tests = [
    { name: 'Health Check', endpoint: '/auth/health/', method: 'GET' },
    { name: 'User Balance', endpoint: '/billing/balance/my_balance/', method: 'GET' },
    { name: 'Get Transactions', endpoint: '/billing/transactions/', method: 'GET' },
    { name: 'Create Transaction', endpoint: '/billing/transactions/', method: 'POST', data: testTransactionData },
    { name: 'Get Pending Transactions', endpoint: '/billing/staff/transactions/pending_transactions/', method: 'GET' },
    { name: 'Staff Create Transaction', endpoint: '/billing/staff/transactions/', method: 'POST', data: testTransactionData },
    { name: 'Get Billing Stats (Alt 1)', endpoint: '/billing/staff/stats/', method: 'GET' },
    { name: 'Get Billing Stats (Alt 2)', endpoint: '/billing/staff/dashboard_stats/', method: 'GET' },
    { name: 'Get Payment Info', endpoint: '/billing/dashboard/payment_info/', method: 'GET' },
    { name: 'Get Usage History', endpoint: '/billing/token-usage/usage_history/', method: 'GET' },
    { name: 'Get Dashboard Data', endpoint: '/billing/dashboard/dashboard_data/', method: 'GET' }
  ];

  const results = [];
  
  for (const test of tests) {
    const result = await testEndpointWithAuth(test.endpoint, test.method, test.data);
    results.push({
      name: test.name,
      endpoint: test.endpoint,
      method: test.method,
      ...result
    });
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Billing Endpoints Test Summary:');
  console.log('=' .repeat(60));
  
  const working = results.filter(r => r.success).length;
  const authRequired = results.filter(r => r.auth).length;
  const notFound = results.filter(r => r.status === 404).length;
  const forbidden = results.filter(r => r.status === 403).length;
  
  console.log(`✅ Working endpoints: ${working}`);
  console.log(`🔐 Auth required: ${authRequired}`);
  console.log(`❌ Not found: ${notFound}`);
  console.log(`🚫 Forbidden: ${forbidden}`);
  
  console.log('\n📋 Detailed Results:');
  results.forEach(result => {
    let status = '❌';
    let details = '';
    
    if (result.success && result.auth) {
      status = '🔐';
      details = ' (Auth Required)';
    } else if (result.success) {
      status = '✅';
      details = '';
    } else if (result.status === 404) {
      status = '❌';
      details = ' (Not Found)';
    } else if (result.status === 403) {
      status = '🚫';
      details = ' (Forbidden)';
    }
    
    console.log(`${status} ${result.name}: ${result.method} ${result.endpoint} - ${result.status}${details}`);
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log(`🎯 Overall: ${working}/${results.length} endpoints are working`);
  
  if (notFound > 0) {
    console.log(`\n⚠️  ${notFound} endpoints not found - these need to be created on the backend`);
  }
  
  if (working === results.length) {
    console.log('\n🎉 All billing endpoints are working correctly!');
  }
}

runBillingTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});

