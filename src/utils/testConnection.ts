// Utility to test backend connection with fallback
export const testBackendConnection = async () => {
  console.log('🧪 Testing Backend Connection with Fallback...');
  
  const endpoints = [
    'https://mipt.pythonanywhere.com/api/auth/login/',
    'http://127.0.0.1:8000/api/auth/login/',
    '/api/auth/login/'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Testing endpoint: ${endpoint}`);
      
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
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connection successful:', {
          endpoint,
          status: response.status,
          data: data
        });
        
        return { 
          success: true, 
          status: response.status, 
          data,
          workingEndpoint: endpoint
        };
      } else {
        console.log(`⚠️ Endpoint failed (${response.status}): ${endpoint}`);
      }
    } catch (error) {
      console.log(`❌ Endpoint error: ${endpoint}`, error);
    }
  }
  
  console.error('❌ All backend endpoints failed');
  return { success: false, error: 'All endpoints failed' };
}; 