// Security utilities for input validation and sanitization
import { validateEmail, validatePassword, sanitizeString } from '@/api/client';

// Input sanitization for different data types
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    return sanitizeString(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item));
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive fields from sanitization
      if (['password', 'token', 'secret', 'api_key'].includes(key)) {
        sanitized[key] = value;
        continue;
      }
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
}

// Enhanced input validation
export function validateInput(data: any, rules: ValidationRules): ValidationResult {
  const errors: string[] = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    if (value !== undefined && value !== null && value !== '') {
      if (rule.type === 'email' && !validateEmail(value)) {
        errors.push(`${field} must be a valid email address`);
      }
      
      if (rule.type === 'password' && !validatePassword(value)) {
        errors.push(`${field} must be at least 8 characters with uppercase, lowercase, and number`);
      }
      
      if (rule.type === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${field} must be at least ${rule.minLength} characters`);
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${field} must be no more than ${rule.maxLength} characters`);
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
      }
      
      if (rule.type === 'number') {
        if (isNaN(Number(value))) {
          errors.push(`${field} must be a valid number`);
        }
        if (rule.min !== undefined && Number(value) < rule.min) {
          errors.push(`${field} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && Number(value) > rule.max) {
          errors.push(`${field} must be no more than ${rule.max}`);
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// CSRF protection
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// XSS prevention
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// SQL injection prevention (basic)
export function sanitizeSQLInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove common SQL injection patterns
  const dangerousPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/gi,
    /(['";\\])/g,
    /(--)/g,
    /(\/\*|\*\/)/g
  ];
  
  let sanitized = input;
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized.substring(0, 1000); // Limit length
}

// File upload security
export function validateFileUpload(file: File, allowedTypes: string[], maxSize: number): ValidationResult {
  const errors: string[] = [];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
  
  // Check for potentially dangerous file extensions
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
  const fileName = file.name.toLowerCase();
  if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
    errors.push('This file type is not allowed for security reasons');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;
  
  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, [now]);
      return true;
    }
    
    const requests = this.requests.get(key)!;
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }
  
  clear(): void {
    this.requests.clear();
  }
}

// Security headers helper
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
}

// Input validation rules interface
export interface ValidationRules {
  [field: string]: {
    required?: boolean;
    type: 'string' | 'email' | 'password' | 'number';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Security constants
export const SECURITY_CONSTANTS = {
  MAX_PASSWORD_LENGTH: 128,
  MIN_PASSWORD_LENGTH: 8,
  MAX_EMAIL_LENGTH: 254,
  MAX_USERNAME_LENGTH: 50,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  RATE_LIMIT: {
    LOGIN: { maxRequests: 5, windowMs: 300000 }, // 5 attempts per 5 minutes
    REGISTER: { maxRequests: 3, windowMs: 600000 }, // 3 attempts per 10 minutes
    PASSWORD_RESET: { maxRequests: 3, windowMs: 600000 }, // 3 attempts per 10 minutes
    API: { maxRequests: 100, windowMs: 60000 } // 100 requests per minute
  }
} as const;

