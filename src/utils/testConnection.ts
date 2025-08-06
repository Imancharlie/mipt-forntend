// Utility to test backend connection with fallback
export const testBackendConnection = async () => {
  console.log('🧪 Testing Backend Connection with Fallback...');
  
  const endpoints = [
    'https://mipt.pythonanywhere.com/api/auth/login/',
    'http://127.0.0.1:8000/api/auth/login/',
    '/api/auth/login/'
  ];
  
  // Test with different credential sets
  const testCredentials = [
    { username: 'admin', password: 'admin123' },
    { username: 'testuser', password: 'testpass123' },
    { username: 'user', password: 'password123' },
    { username: 'demo', password: 'demo123' },
    { username: 'admin', password: 'admin' },
    { username: 'testuser', password: 'testpass' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Testing endpoint: ${endpoint}`);
      
      // Try different credential sets
      for (const credentials of testCredentials) {
        try {
          console.log(`  🔑 Trying credentials: ${credentials.username}`);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connection successful:', {
              endpoint,
              credentials: credentials.username,
              status: response.status,
              data: data
            });
            
            return { 
              success: true, 
              status: response.status, 
              data,
              workingEndpoint: endpoint,
              workingCredentials: credentials
            };
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.log(`  ⚠️ Credentials failed (${response.status}): ${credentials.username}`, errorData);
          }
        } catch (credentialError) {
          console.log(`  ❌ Credential error: ${credentials.username}`, credentialError);
        }
      }
      
      console.log(`❌ All credentials failed for endpoint: ${endpoint}`);
    } catch (error) {
      console.log(`❌ Endpoint error: ${endpoint}`, error);
    }
  }
  
  console.error('❌ All backend endpoints failed');
  return { success: false, error: 'All endpoints and credentials failed' };
}; 