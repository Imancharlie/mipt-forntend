// Enhanced authentication utilities for extended persistence and offline support

// Token expiration settings
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer
const EXTENDED_SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

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

// Check if token needs refresh (within 1 hour of expiry)
export const shouldRefreshToken = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000;
    const currentTime = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    return (expiryTime - currentTime) < oneHour;
  } catch {
    return true;
  }
};

// Check if user should stay logged in (extended session)
export const shouldMaintainSession = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const issuedTime = payload.iat * 1000;
    const currentTime = Date.now();
    
    // Check if token was issued within the last 7 days
    return (currentTime - issuedTime) < EXTENDED_SESSION_DURATION;
  } catch {
    return false;
  }
};

// Get token age in days
export const getTokenAge = (token: string): number => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const issuedTime = payload.iat * 1000;
    const currentTime = Date.now();
    
    return Math.floor((currentTime - issuedTime) / (24 * 60 * 60 * 1000));
  } catch {
    return 0;
  }
};

// Check if user has been inactive for too long
export const isUserInactive = (lastActivity: number): boolean => {
  const currentTime = Date.now();
  const inactiveThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  return (currentTime - lastActivity) > inactiveThreshold;
};

// Update last activity timestamp
export const updateLastActivity = (): void => {
  localStorage.setItem('last_activity', Date.now().toString());
};

// Get last activity timestamp
export const getLastActivity = (): number => {
  const timestamp = localStorage.getItem('last_activity');
  return timestamp ? parseInt(timestamp, 10) : Date.now();
};

// Check if user should be automatically logged out due to inactivity
export const shouldAutoLogout = (): boolean => {
  const lastActivity = getLastActivity();
  const currentTime = Date.now();
  const autoLogoutThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  return (currentTime - lastActivity) > autoLogoutThreshold;
}; 