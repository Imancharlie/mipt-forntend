import axios, { AxiosError } from 'axios';
import { OfflineQueue } from '@/utils/offlineQueue';

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
    } catch {}
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
          const response = await axios.post('https://mipt.pythonanywhere.com/api/auth/refresh', {
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
          
          // Dispatch a custom event to notify the app about auth failure
          window.dispatchEvent(new CustomEvent('auth:token-expired', { 
            detail: { error: refreshError } 
          }));
          
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

// Enhanced API client with offline support
export const apiClientWithOfflineSupport = {
  ...apiClient,
  
  // Enhanced GET method with offline caching
  async get(url: string, config?: any) {
    try {
      return await apiClient.get(url, config);
    } catch (error: any) {
      // If offline, try to get from cache or return offline data
      if (!navigator.onLine) {
        console.log('📴 Offline mode: Attempting to get cached data for', url);
        // You can implement cache logic here
        throw new Error('Offline mode: Data not available in cache');
      }
      throw error;
    }
  },
  
  // Enhanced POST method with offline queuing
  async post(url: string, data?: any, config?: any) {
    try {
      return await apiClient.post(url, data, config);
    } catch (error: any) {
      // If offline, queue the request
      if (!navigator.onLine) {
        console.log('📴 Offline mode: Queuing POST request for', url);
        
        // Determine action type and resource type from URL
        const actionType = determineActionType(url, 'POST');
        const resourceType = determineResourceType(url);
        const description = generateDescription(actionType, resourceType, data);
        
        // Add to offline queue
        await OfflineQueue.add({
          url: apiClient.defaults.baseURL + url,
          method: 'POST',
          body: data,
          actionType,
          resourceType,
          description,
          userFriendlyMessage: generateUserFriendlyMessage(actionType, resourceType),
          maxRetries: 3
        });
        
        // Return a mock success response for offline mode
        return {
          data: { 
            success: true, 
            message: 'Action saved offline and will be synced when connection is restored',
            offline: true 
          },
          status: 200,
          statusText: 'OK'
        };
      }
      throw error;
    }
  },
  
  // Enhanced PUT method with offline queuing
  async put(url: string, data?: any, config?: any) {
    try {
      return await apiClient.put(url, data, config);
    } catch (error: any) {
      // If offline, queue the request
      if (!navigator.onLine) {
        console.log('📴 Offline mode: Queuing PUT request for', url);
        
        const actionType = determineActionType(url, 'PUT');
        const resourceType = determineResourceType(url);
        const description = generateDescription(actionType, resourceType, data);
        
        await OfflineQueue.add({
          url: apiClient.defaults.baseURL + url,
          method: 'PUT',
          body: data,
          actionType,
          resourceType,
          description,
          userFriendlyMessage: generateUserFriendlyMessage(actionType, resourceType),
          maxRetries: 3
        });
        
        return {
          data: { 
            success: true, 
            message: 'Update saved offline and will be synced when connection is restored',
            offline: true 
          },
          status: 200,
          statusText: 'OK'
        };
      }
      throw error;
    }
  },
  
  // Enhanced DELETE method with offline queuing
  async delete(url: string, config?: any) {
    try {
      return await apiClient.delete(url, config);
    } catch (error: any) {
      // If offline, queue the request
      if (!navigator.onLine) {
        console.log('📴 Offline mode: Queuing DELETE request for', url);
        
        const actionType = 'delete';
        const resourceType = determineResourceType(url);
        const description = generateDescription(actionType, resourceType, null);
        
        await OfflineQueue.add({
          url: apiClient.defaults.baseURL + url,
          method: 'DELETE',
          body: null,
          actionType,
          resourceType,
          description,
          userFriendlyMessage: generateUserFriendlyMessage(actionType, resourceType),
          maxRetries: 3
        });
        
        return {
          data: { 
            success: true, 
            message: 'Delete action saved offline and will be synced when connection is restored',
            offline: true 
          },
          status: 200,
          statusText: 'OK'
        };
      }
      throw error;
    }
  }
};

// Helper functions for offline support
function determineActionType(url: string, method: string): 'create' | 'update' | 'delete' | 'enhance' {
  if (method === 'POST') {
    if (url.includes('enhance')) return 'enhance';
    return 'create';
  }
  if (method === 'PUT') return 'update';
  if (method === 'DELETE') return 'delete';
  return 'create';
}

function determineResourceType(url: string): 'daily_report' | 'weekly_report' | 'general_report' | 'profile' | 'other' {
  if (url.includes('daily')) return 'daily_report';
  if (url.includes('weekly')) return 'weekly_report';
  if (url.includes('general')) return 'general_report';
  if (url.includes('profile')) return 'profile';
  return 'other';
}

function generateDescription(actionType: string, resourceType: string, data?: any): string {
  const resourceNames = {
    daily_report: 'Daily Report',
    weekly_report: 'Weekly Report',
    general_report: 'General Report',
    profile: 'Profile',
    other: 'Data'
  };
  
  const actionNames = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
    enhance: 'Enhanced'
  };
  
  return `${actionNames[actionType as keyof typeof actionNames] || 'Modified'} ${resourceNames[resourceType as keyof typeof resourceNames]}`;
}

function generateUserFriendlyMessage(actionType: string, resourceType: string): string {
  const resourceNames = {
    daily_report: 'Daily Report',
    weekly_report: 'Weekly Report',
    general_report: 'General Report',
    profile: 'Profile',
    other: 'Data'
  };
  
  const actionMessages = {
    create: `Created ${resourceNames[resourceType as keyof typeof resourceNames]}`,
    update: `Updated ${resourceNames[resourceType as keyof typeof resourceNames]}`,
    delete: `Deleted ${resourceNames[resourceType as keyof typeof resourceNames]}`,
    enhance: `Enhanced ${resourceNames[resourceType as keyof typeof resourceNames]} with AI`
  };
  
  return actionMessages[actionType as keyof typeof actionMessages] || 'Modified data';
}

export function handleApiError(error: AxiosError): never {
  // Centralized error passthrough (extend as needed)
  throw error;
}
