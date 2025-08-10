import axios, { AxiosError } from 'axios';

// Token manager to handle authentication tokens
let currentToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

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
  const storedToken = localStorage.getItem('access_token');
  if (storedToken) {
    currentToken = storedToken;
  }
};

// Call initialization
initializeToken();

// Axios instance for API calls
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Log the effective base URL for debugging
console.log('API Client initialized with baseURL:', apiClient.defaults.baseURL);
console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);

// Attach bearer token if present
apiClient.interceptors.request.use((config) => {
  try {
    if (currentToken) {
      if (!config.headers) config.headers = {} as any;
      (config.headers as any).Authorization = `Bearer ${currentToken}`;
    }
  } catch {}
  return config;
});

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          const response = await axios.post('http://127.0.0.1:8000/api/auth/refresh', {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          setAuthToken(access);
          
          // Update the original request
          originalRequest.headers.Authorization = `Bearer ${access}`;
          
          // Process queued requests
          processQueue(null, access);
          
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens but DON'T redirect automatically
          processQueue(refreshError, null);
          setAuthToken(null);
          localStorage.removeItem('refresh_token');
          
          // Instead of redirecting, let the store handle the authentication failure
          console.warn('Token refresh failed, authentication state should be cleared by store');
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token, clear access token but DON'T redirect
        setAuthToken(null);
        console.warn('No refresh token available, authentication state should be cleared by store');
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export function handleApiError(error: AxiosError): never {
  // Centralized error passthrough (extend as needed)
  throw error;
}

export default apiClient;
