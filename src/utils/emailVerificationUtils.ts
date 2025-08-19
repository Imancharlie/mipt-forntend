// Utility functions for email verification

export interface EmailVerificationStatus {
  isVerified: boolean;
  email: string;
  needsVerification: boolean;
}

/**
 * Check if a user's email needs verification
 */
export const checkEmailVerificationStatus = (profile: any): EmailVerificationStatus => {
  if (!profile) {
    return {
      isVerified: false,
      email: '',
      needsVerification: true
    };
  }

  const email = profile.user_details?.email || '';
  const isVerified = profile.email_verified || false;

  return {
    isVerified,
    email,
    needsVerification: !isVerified
  };
};

/**
 * Get the appropriate redirect path based on email verification status
 */
export const getEmailVerificationRedirect = (profile: any): string | null => {
  const status = checkEmailVerificationStatus(profile);
  
  if (status.needsVerification) {
    return `/account-activation?email=${encodeURIComponent(status.email)}`;
  }
  
  return null; // No redirect needed
};

/**
 * Check if user should be redirected to account activation
 */
export const shouldRedirectToActivation = (profile: any): boolean => {
  return checkEmailVerificationStatus(profile).needsVerification;
};
