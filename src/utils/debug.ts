// Debug utility to test API connection
import apiClient from '@/api/client';

export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    console.log('Base URL:', apiClient.defaults.baseURL);
    
    // Test a simple endpoint
    const response = await apiClient.get('/auth/health/');
    console.log('API connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('API connection failed:', error);
    console.log('Error details:', {
      message: (error as any).message,
      status: (error as any).response?.status,
      statusText: (error as any).response?.statusText,
      url: (error as any).config?.url,
      baseURL: (error as any).config?.baseURL,
      config: (error as any).config
    });
    
    // Test if backend is reachable
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const testResponse = await fetch(`${baseUrl}/auth/health/`);
      console.log('Direct fetch test:', testResponse.status, testResponse.statusText);
    } catch (fetchError) {
      console.error('Direct fetch also failed:', fetchError);
    }
    
    return false;
  }
};

export const testWeeklyReportEndpoint = async (weekNumber: number) => {
  try {
    console.log(`Testing weekly report endpoint for week ${weekNumber}...`);
    const response = await apiClient.get(`/reports/weekly/week/${weekNumber}/`);
    console.log('Weekly report endpoint successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Weekly report endpoint failed:', error);
    console.log('Error details:', {
      message: (error as any).message,
      status: (error as any).response?.status,
      statusText: (error as any).response?.statusText,
      url: (error as any).config?.url
    });
    return null;
  }
}; 

export const testAIEnhancementEndpoint = async (weeklyReportId: number) => {
  try {
    console.log('🔍 Testing AI Enhancement Endpoint...');
    console.log('Weekly Report ID:', weeklyReportId);
    
    // Test 1: Check if report exists
    console.log('📋 Test 1: Checking if weekly report exists...');
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${baseUrl}/reports/weekly/week/${weeklyReportId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Weekly report exists:', data);
      } else {
        console.error('❌ Weekly report not found:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Error checking weekly report:', error);
      return false;
    }
    
    // Test 2: Test AI enhancement endpoint
    console.log('🤖 Test 2: Testing AI enhancement endpoint...');
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${baseUrl}/reports/weekly/week/${weeklyReportId}/enhance_with_ai/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          additional_instructions: 'Test enhancement'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ AI enhancement successful:', data);
        return true;
      } else {
        const errorData = await response.text();
        console.error('❌ AI enhancement failed:', response.status, response.statusText);
        console.error('Error details:', errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Error testing AI enhancement:', error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}; 