import axios, { AxiosError } from 'axios';
import { getFingerprint } from '@/utils/fingerprint';
import { collectDeviceInfo } from '@/utils/deviceInfo';
import { sanitizeInput, RateLimiter, SECURITY_CONSTANTS } from '@/utils/security';


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
const baseApiUrl = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'https://mipt.pythonanywhere.com/api');

// Security: Rate limiting for failed requests
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_MINUTE = 60;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function checkRateLimit(endpoint: string): boolean {
  const now = Date.now();
  const key = endpoint;
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  
  record.count++;
  return true;
}

function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url, window.location.origin);
    // Only allow relative URLs or same-origin URLs
    if (urlObj.origin !== window.location.origin && !url.startsWith('/')) {
      console.warn('Blocked potentially malicious URL:', url);
      return '/';
    }
    return url;
  } catch {
    console.warn('Invalid URL blocked:', url);
    return '/';
  }
}

export const apiClient = axios.create({
  baseURL: baseApiUrl,
  timeout: 15000, // Reduced timeout for security
  headers: {
    'Content-Type': 'application/json',
  },
});

// Endpoints that must NEVER require auth (avoid sending Authorization header even if we have a token)
const PUBLIC_PATHS: string[] = [
  '/auth/login/',
  '/auth/register/',
  // Password reset endpoints (current)
  '/auth/password-reset/',
  '/auth/password-reset-confirm/',
  '/auth/send-email-otp/',
  '/auth/verify-email-otp/',
  '/auth/check-phone/',
];

function isPublicEndpoint(url?: string): boolean {
  if (!url) return false;
  try {
    // Normalize to path only
    const base = apiClient.defaults.baseURL || '';
    const path = url.startsWith('http') ? new URL(url).pathname : url;
    const normalizedPath = path.replace(base, '');
    return PUBLIC_PATHS.some((p) => normalizedPath.includes(p));
  } catch {
    return PUBLIC_PATHS.some((p) => (url || '').includes(p));
  }
}

// Request interceptor to add auth token and client fingerprint/device metadata
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Security: Rate limiting check
      if (!checkRateLimit(config.url || '')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Security: Sanitize URLs
      if (config.url) {
        config.url = sanitizeUrl(config.url);
      }

      // Security: Validate request data (skip FormData for file uploads)
      if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
        config.data = sanitizeInput(config.data);
      }

      // Never attach Authorization to public endpoints
      if (currentToken && !isPublicEndpoint(config.url)) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      // Attach device headers only for non-public endpoints to avoid CORS preflights
      if (!isPublicEndpoint(config.url)) {
        // Attach fingerprint headers (best-effort)
        try {
          const fp = await getFingerprint();
          if (fp?.visitorId) {
            (config.headers as any)['X-Device-Fingerprint'] = fp.visitorId;
            if (typeof fp.confidence === 'number') {
              (config.headers as any)['X-Device-Fingerprint-Confidence'] = String(fp.confidence);
            }
          }
        } catch {}
        // Attach lightweight device info
        try {
          const info = collectDeviceInfo();
          (config.headers as any)['X-Device-UserAgent'] = info.userAgent;
          (config.headers as any)['X-Device-Locale'] = info.language;
          (config.headers as any)['X-Device-Platform'] = info.platform;
          (config.headers as any)['X-Device-Screen'] = `${info.screen.width}x${info.screen.height}@${info.screen.pixelRatio}`;
          (config.headers as any)['X-Device-Timezone'] = info.timezone;
        } catch {}
      }
      
      // Add retry flag to prevent infinite loops
      (config as any)._retry = false;
      
      // Add timestamp to help with debugging
      (config as any).metadata = { startTime: new Date() };
      
      // Security: Add nonce for CSRF protection
      (config.headers as any)['X-Request-Nonce'] = generateNonce();
      
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
  (response) => {
    // Security: Validate response before returning
    if (!validateResponse(response)) {
      throw new Error('Invalid response received');
    }
    return response;
  },
  async (error: AxiosError) => {
    // Security: Log security-related errors
    if (error.response?.status === 403) {
      console.warn('Access forbidden - potential security issue');
    }
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded by server');
    }
    
    // Simply log the error without taking any authentication action
    if (error.response?.status === 401) {
      const reqUrl = (error.config && (error.config.url || '')) as string;
      if (isPublicEndpoint(reqUrl)) {
        console.log('⚠️ 401 received on a public endpoint. Not prompting login; backend should allow anonymous access.');
      } else {
        console.log('⚠️ 401 Unauthorized response received - user may need to login manually');
      }
    }
    
    return Promise.reject(error);
    }
 );

// Security: Generate nonce for CSRF protection
function generateNonce(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Security: Response validation
function validateResponse(response: any): boolean {
  try {
    // Check for suspicious response patterns
    if (response.data && typeof response.data === 'string') {
      // Block potential XSS payloads
      const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
      ];
      
      if (dangerousPatterns.some(pattern => pattern.test(response.data))) {
        console.warn('Potentially dangerous response blocked');
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

// Offline functionality removed - simplified API client

// All offline helper functions removed

export function handleApiError(error: AxiosError): never {
  // Centralized error passthrough (extend as needed)
  // Security: Sanitize error messages to prevent information leakage
  if (error.response?.data && typeof error.response.data === 'object') {
    const sanitizedData = { ...error.response.data } as any;
    // Remove sensitive information
    delete sanitizedData.password;
    delete sanitizedData.token;
    delete sanitizedData.secret;
    error.response.data = sanitizedData;
  }
  throw error;
}

// Security: Input validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePassword(password: string): boolean {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  // Remove potentially dangerous characters and limit length
  return input
    .replace(/[<>\"'&]/g, '')
    .substring(0, 1000);
}
