// Test API fallback mechanism
export const testApiFallback = async () => {
  console.log('🧪 Testing API Fallback Mechanism...');
  
  const endpoints = [
    'https://mipt.pythonanywhere.com/api/auth/login/',
    'http://127.0.0.1:8000/api/auth/login/',
    '/api/auth/login/'
  ];
  
  for (const endpoint of endpoints) {
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
      
      if (response.ok) {
        console.log(`✅ Endpoint working: ${endpoint}`);
        return endpoint;
      } else {
        console.log(`⚠️ Endpoint failed (${response.status}): ${endpoint}`);
      }
    } catch (error) {
      console.log(`❌ Endpoint error: ${endpoint}`, error);
    }
  }
  
  console.log('❌ All endpoints failed');
  return null;
};

// Test current API configuration
export const testCurrentApiConfig = () => {
  console.log('📡 Current API Configuration:');
  console.log('Environment:', import.meta.env.MODE);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('Base URL:', import.meta.env.VITE_API_URL || 'Not set');
  
  // Test the API client base URL
  const baseUrl = import.meta.env.VITE_API_URL || 
                  (import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : '/api');
  
  console.log('Effective Base URL:', baseUrl);
  return baseUrl;
}; 