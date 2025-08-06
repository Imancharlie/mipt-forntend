import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { useAppStore } from '@/store';
import { isTokenExpired } from '@/utils/auth';



// Get the API base URL from environment or use a fallback
const getApiBaseUrl = () => {
  // Priority 1: Environment variable (most flexible)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Development mode with default backend port
  if (import.meta.env.DEV) {
    // For local development, use 127.0.0.1:8000
    return 'http://127.0.0.1:8000/api';
  }
  
  // Priority 3: Production fallback (relative URL)
  return '/api';
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for CORS
});

// Utility function to clear auth state
const clearAuthState = () => {
  const store = useAppStore.getState();
  store.setUser(null);
  store.setTokens({ access: null, refresh: null });
  store.setIsAuthenticated(false);
  store.setProfile(null);
  store.setDashboardStats(null);
};

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const store = useAppStore.getState();
    const token = store.tokens.access;
    
    // Skip authentication for login, register, and token refresh endpoints
    const isAuthEndpoint = config.url?.includes('/auth/login/') || 
                          config.url?.includes('/auth/register/') ||
                          config.url?.includes('/auth/token/refresh/');
    
    if (!isAuthEndpoint && token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!isAuthEndpoint && token && isTokenExpired(token)) {
      // Token is expired, clear it
      store.setTokens({ access: null, refresh: store.tokens.refresh });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Check if this is a 401 error and not a refresh token request or logout request
    if (error.response?.status === 401 && originalRequest && 
        !originalRequest.url?.includes('/auth/token/refresh/') && 
        !originalRequest.url?.includes('/auth/logout/')) {
      
      const store = useAppStore.getState();
      const refreshToken = store.tokens.refresh;
      
      if (refreshToken && !isTokenExpired(refreshToken)) {
        try {
          // Create a new axios instance for refresh to avoid interceptor loop
          const refreshResponse = await axios.post('/api/auth/token/refresh/', {
            refresh: refreshToken
          });
          
          const { access } = refreshResponse.data;
          store.setTokens({ access, refresh: refreshToken });
          
          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Token refresh failed, clear auth state
          clearAuthState();
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token or expired refresh token, clear auth state
        clearAuthState();
      }
    }
    
    return Promise.reject(error);
  }
);

// Error handler utility
export const handleApiError = (error: AxiosError) => {
  const store = useAppStore.getState();
  
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        store.setError({
          message: (data as any)?.message || 'Invalid request data. Please check your input.',
          type: 'validation',
          field: (data as any)?.field,
        });
        break;
      case 401:
        if (error.config?.url?.includes('/auth/login/')) {
          store.setError({
            message: 'Invalid username or password. Please check your credentials.',
            type: 'auth',
          });
        } else {
          store.setError({
            message: 'Authentication required. Please log in again.',
            type: 'auth',
          });
        }
        break;
      case 403:
        store.setError({
          message: 'Access denied. You do not have permission to perform this action.',
          type: 'auth',
        });
        break;
      case 404:
        store.setError({
          message: 'Resource not found. Please check the URL or contact support.',
          type: 'general',
        });
        break;
      case 500:
        store.setError({
          message: 'Server error. Please try again later or contact support.',
          type: 'network',
        });
        break;
      default:
        store.setError({
          message: (data as any)?.message || 'An unexpected error occurred. Please try again.',
          type: 'general',
        });
    }
  } else if (error.request) {
    // Network error
    store.setError({
      message: 'Network error. Please check your internet connection and try again. If the problem persists, contact support.',
      type: 'network',
      retry: () => {
        // Retry the last request
        if (error.config) {
          apiClient(error.config);
        }
      },
    });
  } else {
    // Other error
    store.setError({
      message: error.message || 'An error occurred. Please try again.',
      type: 'general',
    });
  }
};

export default apiClient; 