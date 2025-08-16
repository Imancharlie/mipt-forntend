#!/usr/bin/env node

/**
 * Test script for user-transactions API endpoint
 * This script tests the /api/billing/user-transactions/ endpoint
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE = 'https://mipt.pythonanywhere.com/api';
const ENDPOINT = '/billing/user-transactions/';
const FULL_URL = API_BASE + ENDPOINT;

// Test token (you'll need to replace this with a valid token)
const TEST_TOKEN = process.argv[2] || 'your_test_token_here';

console.log('🧪 Testing User Transactions API Endpoint');
console.log('=====================================');
console.log(`URL: ${FULL_URL}`);
console.log(`Token: ${TEST_TOKEN ? 'Provided' : 'Not provided'}`);
console.log('');

if (!TEST_TOKEN || TEST_TOKEN === 'your_test_token_here') {
  console.log('❌ Please provide a valid token as the first argument:');
  console.log('   node test-user-transactions.js YOUR_TOKEN_HERE');
  console.log('');
  console.log('💡 You can get a token by logging into the MIPT application');
  process.exit(1);
}

// Make the API request
function makeRequest() {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'MIPT-Test-Script/1.0'
      }
    };

    const req = https.request(FULL_URL, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout after 10 seconds'));
    });

    req.end();
  });
}

// Run the test
async function runTest() {
  try {
    console.log('🚀 Making API request...');
    const response = await makeRequest();
    
    console.log('✅ Response received:');
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers['content-type']}`);
    console.log('');
    
    if (response.parseError) {
      console.log('⚠️  Response could not be parsed as JSON:');
      console.log(response.data);
      console.log('');
      console.log(`Parse error: ${response.parseError}`);
    } else {
      console.log('📊 Response data:');
      console.log(JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        console.log('');
        console.log('🎉 API call successful!');
        console.log(`Found ${response.data.data?.length || 0} transactions`);
      } else {
        console.log('');
        console.log('❌ API call failed with success: false');
        console.log(`Error: ${response.data.message || 'Unknown error'}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Request failed:');
    console.log(error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('');
      console.log('💡 This might mean:');
      console.log('   - The domain is not accessible');
      console.log('   - There\'s a network connectivity issue');
      console.log('   - The API endpoint is not deployed yet');
    }
  }
}

// Run the test
runTest();
