import fetch from 'node-fetch';

// Test API configuration
async function testApiConfiguration() {
  console.log('🔧 Testing API Configuration...\n');

  // Get API URL from environment
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:8000/api';
  console.log(`📡 API URL: ${apiUrl}`);

  // Test endpoints
  const endpoints = [
    '/auth/profile/',
    '/reports/daily/',
    '/reports/weekly/',
    '/companies/'
  ];

  console.log('\n🧪 Testing API Endpoints...\n');

  for (const endpoint of endpoints) {
    const fullUrl = `${apiUrl}${endpoint}`;
    console.log(`Testing: ${fullUrl}`);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000
      });

      if (response.ok) {
        console.log(`✅ ${endpoint} - OK (${response.status})`);
      } else {
        console.log(`⚠️  ${endpoint} - ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
    }
  }

  console.log('\n📊 API Configuration Summary:');
  console.log(`- Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`- API Base URL: ${apiUrl}`);
  console.log(`- Frontend URL: ${process.env.VITE_APP_URL || 'http://localhost:3000'}`);
  
  console.log('\n💡 Tips:');
  console.log('- If you see connection errors, make sure your backend is running');
  console.log('- Check that your backend is on the correct port (default: 8000)');
  console.log('- Verify CORS settings on your backend');
  console.log('- Use VITE_API_URL environment variable to override the default');
}

// Run the test
testApiConfiguration().catch(console.error); 