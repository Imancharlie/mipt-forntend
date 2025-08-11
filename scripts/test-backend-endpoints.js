#!/usr/bin/env node

/**
 * Backend Endpoints Test Script
 * Tests the new authentication endpoints to ensure they're working correctly
 */

const API_BASE = 'https://mipt.pythonanywhere.com/api';

// Test data
const testPhoneNumbers = [
  '0712345678',    // Valid local format
  '0614021404',    // Another valid number
  '255712345678',  // With 255 prefix
  '+255712345678', // International format
  '123',           // Invalid (too short)
  'abcdefghij'     // Invalid (non-numeric)
];

const testRegistrationData = {
  username: 'testuser123',
  email: 'test123@example.com',
  first_name: 'Test',
  last_name: 'User',
  password: 'securepass123',
  phone_number: '0712345678'
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

// Test phone number validation endpoint
async function testPhoneValidation() {
  console.log('\n📱 Testing Phone Number Validation Endpoint');
  console.log('=' .repeat(50));
  
  for (const phoneNumber of testPhoneNumbers) {
    const result = await makeApiCall(`/auth/check-phone/?phone_number=${phoneNumber}`);
    
    if (result.success) {
      console.log(`✅ Phone ${phoneNumber}: ${result.data.message}`);
    } else {
      console.log(`❌ Phone ${phoneNumber}: ${result.status} ${result.statusText}`);
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Test registration endpoint
async function testRegistration() {
  console.log('\n📝 Testing User Registration Endpoint');
  console.log('=' .repeat(50));
  
  const result = await makeApiCall('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(testRegistrationData)
  });
  
  if (result.success) {
    console.log(`✅ Registration successful: ${result.data.message}`);
    console.log(`   User ID: ${result.data.user_id}`);
    console.log(`   Access Token: ${result.data.access_token ? 'Present' : 'Missing'}`);
  } else {
    console.log(`❌ Registration failed: ${result.status} ${result.statusText}`);
  }
}

// Test existing endpoints to ensure they still work
async function testExistingEndpoints() {
  console.log('\n🔍 Testing Existing Endpoints');
  console.log('=' .repeat(50));
  
  const endpoints = [
    '/auth/login/',
    '/auth/profile/',
    '/reports/',
    '/billing/balance/'
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeApiCall(endpoint);
    if (result.success) {
      console.log(`✅ ${endpoint}: Working`);
    } else if (result.status === 401) {
      console.log(`🔐 ${endpoint}: Requires authentication (expected)`);
    } else {
      console.log(`❌ ${endpoint}: ${result.status} ${result.statusText}`);
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Backend Endpoints Test');
  console.log('=' .repeat(50));
  console.log(`🌐 Testing against: ${API_BASE}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  try {
    // Test existing endpoints first
    await testExistingEndpoints();
    
    // Test new phone validation endpoint
    await testPhoneValidation();
    
    // Test new registration endpoint
    await testRegistration();
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('\n💥 Test execution failed:', error);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testPhoneValidation,
  testRegistration,
  testExistingEndpoints,
  runTests
};
