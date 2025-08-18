import axios, { AxiosError } from 'axios';


// Token manager to handle authentication tokens
let currentToken: string | null = null;



export const setAuthToken = (token: string | null) => {
  currentToken = token;
  // Also update localStorage for persistence
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
};

// Initialize token from localStorage on module load
const initializeToken = () => {
  const token = localStorage.getItem('access_token');
  if (token) {
    currentToken = token;
  }
};

initializeToken();

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://mipt.pythonanywhere.com/api',
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    try {
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      
      // Add retry flag to prevent infinite loops
      (config as any)._retry = false;
      
      // Add timestamp to help with debugging
      (config as any).metadata = { startTime: new Date() };
      
    } catch (error) {
      console.warn('Error in request interceptor:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - simplified, no automatic logout on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Simply log the error without taking any authentication action
    if (error.response?.status === 401) {
      console.log('⚠️ 401 Unauthorized response received - user may need to login manually');
    }
    
    return Promise.reject(error);
  }
);

// Offline functionality removed - simplified API client

// All offline helper functions removed

export function handleApiError(error: AxiosError): never {
  // Centralized error passthrough (extend as needed)
  throw error;
}
