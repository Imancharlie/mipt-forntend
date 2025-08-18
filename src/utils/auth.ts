// Simplified authentication utilities - no automatic logouts

// Token expiration settings - minimal buffer to prevent edge cases
const TOKEN_EXPIRY_BUFFER = 1 * 60 * 1000; // 1 minute buffer

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
  localStorage.setItem('last_activity', Date.now().toString());
};

// Get last activity timestamp
export const getLastActivity = (): number => {
  const timestamp = localStorage.getItem('last_activity');
  return timestamp ? parseInt(timestamp, 10) : Date.now();
}; 