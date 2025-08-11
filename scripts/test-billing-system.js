#!/usr/bin/env node

/**
 * Billing System Test Script
 * Tests all billing endpoints to ensure they're working correctly
 */

const API_BASE = 'https://mipt.pythonanywhere.com/api';

// Test data
const testTransactionData = {
  user_phone_number: '0712345678',
  sender_name: 'Test User',
  payment_method: 'DIRECT',
  amount: 2000
};

const testStaffTransactionData = {
  user_id: 1,
  user_phone_number: '0712345678',
  sender_name: 'Test User',
  payment_method: 'DIRECT',
  amount: 2000
};

// Utility function to make API calls
async function makeApiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };

  try {
    console.log(`🔍 Testing: ${defaultOptions.method} ${endpoint}`);
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      console.log(`❌ ${response.status} ${response.statusText}`);
      if (response.headers.get('content-type')?.includes('application/json')) {
        const errorData = await response.json();
        console.log(`   Error details:`, errorData);
      }
      return { success: false, status: response.status, statusText: response.statusText };
    }

    const data = await response.json();
    console.log(`✅ Success: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    return { success: true, data, status: response.status };
  } catch (error) {
    console.log(`💥 Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  return await makeApiCall('/auth/health/');
}

async function testUserBalance() {
  console.log('\n💰 Testing User Balance...');
  return await makeApiCall('/billing/balance/my_balance/');
}

async function testCreateTransaction() {
  console.log('\n💳 Testing Create Transaction...');
  return await makeApiCall('/billing/transactions/', {
    method: 'POST',
    body: JSON.stringify(testTransactionData)
  });
}

async function testGetTransactions() {
  console.log('\n📋 Testing Get Transactions...');
  return await makeApiCall('/billing/transactions/');
}

async function testGetPendingTransactions() {
  console.log('\n⏳ Testing Get Pending Transactions...');
  return await makeApiCall('/billing/staff/transactions/pending_transactions/');
}

async function testStaffCreateTransaction() {
  console.log('\n👨‍💼 Testing Staff Create Transaction...');
  return await makeApiCall('/billing/staff/transactions/', {
    method: 'POST',
    body: JSON.stringify(testStaffTransactionData)
  });
}

async function testGetBillingStats() {
  console.log('\n📊 Testing Get Billing Stats...');
  return await makeApiCall('/billing/staff/billing_stats/');
}

async function testGetPaymentInfo() {
  console.log('\n💡 Testing Get Payment Info...');
  return await makeApiCall('/billing/dashboard/payment_info/');
}

async function testGetUsageHistory() {
  console.log('\n📈 Testing Get Usage History...');
  return await makeApiCall('/billing/token-usage/usage_history/');
}

async function testGetDashboardData() {
  console.log('\n🏠 Testing Get Dashboard Data...');
  return await makeApiCall('/billing/dashboard/dashboard_data/');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Billing System Tests...');
  console.log(`📍 API Base: ${API_BASE}`);
  console.log('=' .repeat(60));

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Balance', fn: testUserBalance },
    { name: 'Create Transaction', fn: testCreateTransaction },
    { name: 'Get Transactions', fn: testGetTransactions },
    { name: 'Get Pending Transactions', fn: testGetPendingTransactions },
    { name: 'Staff Create Transaction', fn: testStaffCreateTransaction },
    { name: 'Get Billing Stats', fn: testGetBillingStats },
    { name: 'Get Payment Info', fn: testGetPaymentInfo },
    { name: 'Get Usage History', fn: testGetUsageHistory },
    { name: 'Get Dashboard Data', fn: testGetDashboardData }
  ];

  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({
        name: test.name,
        success: result.success,
        status: result.status,
        error: result.error
      });
    } catch (error) {
      results.push({
        name: test.name,
        success: false,
        error: error.message
      });
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Test Results Summary:');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const details = result.success 
      ? `Status: ${result.status}` 
      : `Error: ${result.error}`;
    console.log(`${status} ${result.name}: ${details}`);
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log(`🎯 Overall: ${successful}/${results.length} tests passed`);
  
  if (failed > 0) {
    console.log(`⚠️  ${failed} tests failed - check the logs above for details`);
    process.exit(1);
  } else {
    console.log('🎉 All tests passed! Billing system is working correctly.');
  }
}

// Run tests if this script is executed directly
runAllTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});
