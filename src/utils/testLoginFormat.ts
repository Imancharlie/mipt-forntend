// Test login format to match backend expectations
export const testLoginFormat = async () => {
  console.log('🔍 Testing Login Format for Backend...');
  
  const endpoint = 'http://127.0.0.1:8000/api/auth/login/';
  
  // Test the exact format your backend expects
  const testCases = [
    {
      name: 'Standard Format',
      data: {
        username: 'testuser',
        password: 'testpass123'
      }
    },
    {
      name: 'Admin Format',
      data: {
        username: 'admin',
        password: 'admin123'
      }
    },
    {
      name: 'Simple Format',
      data: {
        username: 'user',
        password: 'password123'
      }
    }
  ];
  
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
        
        if (response.ok) {
          console.log(`✅ SUCCESS with format: ${testCase.name}`);
          console.log(`🎉 Login successful! User: ${responseData.user?.username}`);
          return { 
            success: true, 
            format: testCase.name, 
            data: testCase.data,
            response: responseData
          };
        } else {
          console.log(`❌ Failed with format: ${testCase.name}`);
          console.log(`📝 Error details:`, responseData);
        }
      } catch (parseError) {
        const textResponse = await response.text();
        console.log(`📥 Response text:`, textResponse);
      }
      
    } catch (error) {
      console.log(`❌ Error with format: ${testCase.name}`, error);
    }
  }
  
  console.log('\n❌ All login formats failed');
  return { success: false, error: 'All formats failed' };
};

// Test with specific credentials
export const testSpecificCredentials = async (username: string, password: string) => {
  console.log(`🔍 Testing specific credentials: ${username}`);
  
  const endpoint = 'http://127.0.0.1:8000/api/auth/login/';
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    
    try {
      const responseData = await response.json();
      console.log(`📥 Response data:`, responseData);
      
      if (response.ok) {
        console.log(`✅ SUCCESS! Login worked with ${username}`);
        return { success: true, data: responseData };
      } else {
        console.log(`❌ FAILED! Login failed with ${username}`);
        return { success: false, error: responseData };
      }
    } catch (parseError) {
      const textResponse = await response.text();
      console.log(`📥 Response text:`, textResponse);
      return { success: false, error: textResponse };
    }
    
  } catch (error) {
    console.log(`❌ Network error:`, error);
    return { success: false, error: error };
  }
}; 