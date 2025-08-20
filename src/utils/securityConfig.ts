// Security configuration and policies
export const SECURITY_CONFIG = {
  // Authentication security
  AUTH: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    PASSWORD_HISTORY: 5, // Remember last 5 passwords
    REQUIRE_STRONG_PASSWORD: true,
    ENABLE_2FA: true,
    MAX_SESSIONS: 3, // Max concurrent sessions
  },

  // Input validation
  VALIDATION: {
    MAX_STRING_LENGTH: 1000,
    MAX_EMAIL_LENGTH: 254,
    MAX_USERNAME_LENGTH: 50,
    MAX_PASSWORD_LENGTH: 128,
    MIN_PASSWORD_LENGTH: 8,
    ALLOWED_USERNAME_CHARS: /^[a-zA-Z0-9_-]+$/,
    ALLOWED_EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    STRONG_PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  },

  // File upload security
  FILE_UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    BLOCKED_EXTENSIONS: [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
      '.php', '.asp', '.aspx', '.jsp', '.jar', '.war', '.ear'
    ],
    SCAN_VIRUSES: true, // If you have virus scanning capability
  },

  // Rate limiting
  RATE_LIMITING: {
    LOGIN: { maxRequests: 5, windowMs: 5 * 60 * 1000 }, // 5 attempts per 5 minutes
    REGISTER: { maxRequests: 3, windowMs: 10 * 60 * 1000 }, // 3 attempts per 10 minutes
    PASSWORD_RESET: { maxRequests: 3, windowMs: 10 * 60 * 1000 }, // 3 attempts per 10 minutes
    API: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
    UPLOAD: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 uploads per minute
  },

  // Content Security Policy
  CSP: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"], // Consider removing unsafe-inline in production
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'", 'https://mipt.pythonanywhere.com'],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },

  // Headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },

  // Session security
  SESSION: {
    SECURE_COOKIES: true,
    HTTP_ONLY_COOKIES: true,
    SAME_SITE: 'strict',
    COOKIE_PREFIX: '__Secure-',
    REGENERATE_ID_ON_LOGIN: true,
  },

  // Logging and monitoring
  MONITORING: {
    LOG_SECURITY_EVENTS: true,
    LOG_FAILED_LOGINS: true,
    LOG_SUSPICIOUS_ACTIVITY: true,
    ALERT_ON_BRUTE_FORCE: true,
    ALERT_ON_UNUSUAL_ACTIVITY: true,
    LOG_LEVEL: 'warn', // 'debug', 'info', 'warn', 'error'
  },

  // Development vs Production
  ENVIRONMENT: {
    DEV: {
      ENABLE_DEBUG_LOGGING: true,
      SHOW_ERROR_DETAILS: true,
      RELAXED_VALIDATION: false,
      MOCK_SECURITY_CHECKS: false,
    },
    PROD: {
      ENABLE_DEBUG_LOGGING: false,
      SHOW_ERROR_DETAILS: false,
      RELAXED_VALIDATION: false,
      MOCK_SECURITY_CHECKS: false,
    }
  }
} as const;

// Security policy enforcer
export class SecurityPolicyEnforcer {
  private static instance: SecurityPolicyEnforcer;
  private violations: Array<{ type: string; message: string; timestamp: Date }> = [];

  private constructor() {}

  static getInstance(): SecurityPolicyEnforcer {
    if (!SecurityPolicyEnforcer.instance) {
      SecurityPolicyEnforcer.instance = new SecurityPolicyEnforcer();
    }
    return SecurityPolicyEnforcer.instance;
  }

  // Enforce password policy
  enforcePasswordPolicy(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = SECURITY_CONFIG.VALIDATION;

    if (password.length < config.MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${config.MIN_PASSWORD_LENGTH} characters long`);
    }

    if (password.length > config.MAX_PASSWORD_LENGTH) {
      errors.push(`Password must be no more than ${config.MAX_PASSWORD_LENGTH} characters long`);
    }

    if (SECURITY_CONFIG.AUTH.REQUIRE_STRONG_PASSWORD) {
      if (!config.STRONG_PASSWORD_PATTERN.test(password)) {
        errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Enforce file upload policy
  enforceFileUploadPolicy(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = SECURITY_CONFIG.FILE_UPLOAD;

    if (file.size > config.MAX_FILE_SIZE) {
      errors.push(`File size must be less than ${Math.round(config.MAX_FILE_SIZE / 1024 / 1024)}MB`);
    }

    if (!config.ALLOWED_TYPES.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    const fileName = file.name.toLowerCase();
    if (config.BLOCKED_EXTENSIONS.some(ext => fileName.endsWith(ext))) {
      errors.push('This file type is not allowed for security reasons');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Log security violation
  logViolation(type: string, message: string): void {
    const violation = {
      type,
      message,
      timestamp: new Date()
    };

    this.violations.push(violation);

    if (SECURITY_CONFIG.MONITORING.LOG_SECURITY_EVENTS) {
      console.warn('Security violation:', violation);
    }

    // In production, you might want to send this to a security monitoring service
    if (import.meta.env.PROD) {
      // Send to security monitoring service
      this.reportToSecurityService(violation);
    }
  }

  // Get recent violations
  getRecentViolations(minutes: number = 60): Array<{ type: string; message: string; timestamp: Date }> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.violations.filter(v => v.timestamp > cutoff);
  }

  // Clear old violations
  clearOldViolations(hours: number = 24): void {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    this.violations = this.violations.filter(v => v.timestamp > cutoff);
  }

  private reportToSecurityService(violation: { type: string; message: string; timestamp: Date }): void {
    // Implement reporting to your security monitoring service
    // This could be Sentry, LogRocket, or a custom service
    try {
      // Example: Send to analytics service
      if (typeof gtag !== 'undefined') {
        gtag('event', 'security_violation', {
          event_category: 'security',
          event_label: violation.type,
          value: 1
        });
      }
    } catch (error) {
      console.warn('Failed to report security violation:', error);
    }
  }
}

// Export singleton instance
export const securityEnforcer = SecurityPolicyEnforcer.getInstance();

