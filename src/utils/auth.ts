// Authentication utilities with improved session management

// Token expiration settings - minimal buffer to prevent edge cases
const TOKEN_EXPIRY_BUFFER = 1 * 60 * 1000; // 1 minute buffer

// Inactivity timeout settings
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const ACTIVITY_DEBOUNCE = 1000; // 1 second debounce to avoid excessive resets

// Session expiry settings - force logout for very old sessions
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours (1 day)
const SESSION_CHECK_INTERVAL = 60 * 60 * 1000; // Check every hour

// Inactivity tracking
let inactivityTimer: NodeJS.Timeout | null = null;
let lastActivityTime = Date.now();
let isTracking = false;
let onWarningCallback: ((timeLeft: number) => void) | null = null;
let warningTimer: NodeJS.Timeout | null = null;

// Utility function to check if JWT token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    // Add buffer time to prevent edge cases
    return (expiryTime - TOKEN_EXPIRY_BUFFER) < currentTime;
  } catch {
    return true;
  }
};

// Utility function to get token payload
export const getTokenPayload = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

// Utility function to check if token is valid (not expired and properly formatted)
export const isTokenValid = (token: string | null): boolean => {
  return Boolean(token) && !isTokenExpired(token!);
};

// Update last activity timestamp
export const updateLastActivity = (): void => {
  lastActivityTime = Date.now();
  localStorage.setItem('last_activity', lastActivityTime.toString());
};

// Get last activity timestamp
export const getLastActivity = (): number => {
  const timestamp = localStorage.getItem('last_activity');
  return timestamp ? parseInt(timestamp, 10) : Date.now();
};

// Start inactivity tracking
export const startInactivityTracking = (
  onTimeout: () => void, 
  onWarning?: (timeLeft: number) => void
): void => {
  if (isTracking) return;
  
  isTracking = true;
  onWarningCallback = onWarning || null;
  lastActivityTime = getLastActivity();
  
  // Reset timer on any user activity
  const resetTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    if (warningTimer) {
      clearTimeout(warningTimer);
    }
    
    updateLastActivity();
    
    // Set warning timer (2 minutes before timeout)
    if (onWarningCallback) {
      warningTimer = setTimeout(() => {
        const timeLeft = INACTIVITY_TIMEOUT - (2 * 60 * 1000);
        onWarningCallback!(timeLeft);
      }, INACTIVITY_TIMEOUT - (2 * 60 * 1000));
    }
    
    // Set main timeout
    inactivityTimer = setTimeout(() => {
      console.log('🕐 Inactivity timeout reached - logging out user');
      onTimeout();
    }, INACTIVITY_TIMEOUT);
  };
  
  // Debounced activity handler to avoid excessive timer resets
  let debounceTimer: NodeJS.Timeout | null = null;
  const handleActivity = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    debounceTimer = setTimeout(() => {
      resetTimer();
    }, ACTIVITY_DEBOUNCE);
  };
  
  // Listen for user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  events.forEach(event => {
    document.addEventListener(event, handleActivity, { passive: true });
  });
  
  // Start the initial timer
  resetTimer();
  
  // Store cleanup function
  (window as any).__inactivityCleanup = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    if (warningTimer) {
      clearTimeout(warningTimer);
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    events.forEach(event => {
      document.removeEventListener(event, handleActivity);
    });
    isTracking = false;
    onWarningCallback = null;
  };
};

// Stop inactivity tracking
export const stopInactivityTracking = (): void => {
  if ((window as any).__inactivityCleanup) {
    (window as any).__inactivityCleanup();
  }
  
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  
  isTracking = false;
}; 

// Get time remaining until logout
export const getTimeRemaining = (): number => {
  if (!isTracking) return 0;
  
  const timeSinceLastActivity = Date.now() - lastActivityTime;
  const timeRemaining = INACTIVITY_TIMEOUT - timeSinceLastActivity;
  
  return Math.max(0, timeRemaining);
};

// Check if session is too old (more than 24 hours)
export const isSessionExpired = (): boolean => {
  const lastActivity = getLastActivity();
  const timeSinceLastActivity = Date.now() - lastActivity;
  return timeSinceLastActivity > SESSION_EXPIRY;
};

// Get session age in hours
export const getSessionAge = (): number => {
  const lastActivity = getLastActivity();
  const timeSinceLastActivity = Date.now() - lastActivity;
  return Math.floor(timeSinceLastActivity / (60 * 60 * 1000));
};

// Extend session (called when user clicks "Stay Active")
export const extendSession = (): void => {
  if (!isTracking) return;
  
  updateLastActivity();
  
  // Reset the timers
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  if (warningTimer) {
    clearTimeout(warningTimer);
  }
  
  // Set new warning timer
  if (onWarningCallback) {
    warningTimer = setTimeout(() => {
      const timeLeft = INACTIVITY_TIMEOUT - (2 * 60 * 1000);
      onWarningCallback!(timeLeft);
    }, INACTIVITY_TIMEOUT - (2 * 60 * 1000));
  }
  
  // Set new main timeout
  inactivityTimer = setTimeout(() => {
    console.log('🕐 Inactivity timeout reached - logging out user');
    if (onWarningCallback) {
      onWarningCallback(0); // Trigger timeout
    }
  }, INACTIVITY_TIMEOUT);
};

// Start session expiry monitoring
export const startSessionExpiryMonitoring = (onSessionExpired: () => void): void => {
  // Check session expiry every hour
  const sessionCheckInterval = setInterval(() => {
    if (isSessionExpired()) {
      console.log('🕐 Session expired (24+ hours old), logging out user');
      onSessionExpired();
      clearInterval(sessionCheckInterval);
    }
  }, SESSION_CHECK_INTERVAL);
  
  // Store cleanup function
  (window as any).__sessionExpiryCleanup = () => {
    clearInterval(sessionCheckInterval);
  };
};

// Stop session expiry monitoring
export const stopSessionExpiryMonitoring = (): void => {
  if ((window as any).__sessionExpiryCleanup) {
    (window as any).__sessionExpiryCleanup();
  }
}; 