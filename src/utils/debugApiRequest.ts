// Debug API request format and response
export const debugApiRequest = async () => {
  console.log('🔍 Debugging API Request Format...');
  
  const testCases = [
    // Standard login format
    {
      name: 'Standard Login',
      data: {
        username: 'testuser',
        password: 'testpass'
      }
    },
    // Alternative field names
    {
      name: 'Email Login',
      data: {
        email: 'test@example.com',
        password: 'testpass'
      }
    },
    // Different field names
    {
      name: 'User Login',
      data: {
        user: 'testuser',
        password: 'testpass'
      }
    },
    // With additional fields
    {
      name: 'Extended Login',
      data: {
        username: 'testuser',
        password: 'testpass',
        remember: true
      }
    },
    // Minimal format
    {
      name: 'Minimal Login',
      data: {
        username: 'testuser',
        password: 'testpass'
      }
    }
  ];
  
  const endpoint = 'http://127.0.0.1:8000/api/auth/login/';
  
  for (const testCase of testCases) {
    try {
      console.log(`\n🔄 Testing: ${testCase.name}`);
      console.log(`📤 Request data:`, testCase.data);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });
      
      console.log(`📊 Response status: ${response.status} ${response.statusText}`);
      
      // Try to get response body
      try {
        const responseData = await response.json();
        console.log(`📥 Response data:`, responseData);
      } catch (parseError) {
        const textResponse = await response.text();
        console.log(`📥 Response text:`, textResponse);
      }
      
      if (response.ok) {
        console.log(`✅ SUCCESS with format: ${testCase.name}`);
        return { success: true, format: testCase.name, data: testCase.data };
      } else {
        console.log(`❌ Failed with format: ${testCase.name}`);
      }
      
    } catch (error) {
      console.log(`❌ Error with format: ${testCase.name}`, error);
    }
  }
  
  console.log('\n❌ All request formats failed');
  return { success: false, error: 'All formats failed' };
};

// Test different HTTP methods
export const debugApiMethods = async () => {
  console.log('🔍 Debugging API HTTP Methods...');
  
  const methods = ['POST', 'PUT', 'PATCH'];
  const endpoint = 'http://127.0.0.1:8000/api/auth/login/';
  const testData = { username: 'testuser', password: 'testpass' };
  
  for (const method of methods) {
    try {
      console.log(`\n🔄 Testing method: ${method}`);
      
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      console.log(`📊 Response: ${response.status} ${response.statusText}`);
      
      try {
        const responseData = await response.json();
        console.log(`📥 Response data:`, responseData);
      } catch (parseError) {
        const textResponse = await response.text();
        console.log(`📥 Response text:`, textResponse);
      }
      
    } catch (error) {
      console.log(`❌ Error with method: ${method}`, error);
    }
  }
};

// Check API endpoint structure
export const checkApiEndpoints = async () => {
  console.log('🔍 Checking API Endpoint Structure...');
  
  const possibleEndpoints = [
    'http://127.0.0.1:8000/api/auth/login/',
    'http://127.0.0.1:8000/api/auth/login',
    'http://127.0.0.1:8000/api/login/',
    'http://127.0.0.1:8000/api/login',
    'http://127.0.0.1:8000/auth/login/',
    'http://127.0.0.1:8000/auth/login',
    'http://127.0.0.1:8000/login/',
    'http://127.0.0.1:8000/login'
  ];
  
  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`\n🔄 Testing endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'testuser', password: 'testpass' })
      });
      
      console.log(`📊 Response: ${response.status} ${response.statusText}`);
      
      if (response.status !== 404) {
        try {
          const responseData = await response.json();
          console.log(`📥 Response data:`, responseData);
        } catch (parseError) {
          const textResponse = await response.text();
          console.log(`📥 Response text:`, textResponse);
        }
      }
      
    } catch (error) {
      console.log(`❌ Error:`, error);
    }
  }
}; 