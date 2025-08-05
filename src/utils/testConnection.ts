// Utility to test backend connection
export const testBackendConnection = async () => {
  try {
    const response = await fetch('/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'testpass'
      })
    });
    
    const data = await response.json();
    console.log('Backend connection test:', {
      status: response.status,
      data: data
    });
    
    return { success: true, status: response.status, data };
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return { success: false, error };
  }
}; 