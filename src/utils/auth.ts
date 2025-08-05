// Utility function to check if JWT token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
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