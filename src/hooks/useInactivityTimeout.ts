import { useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimeoutOptions {
  timeout: number; // in milliseconds
  onTimeout: () => void;
  onWarning?: (timeLeft: number) => void;
  warningTime?: number; // when to show warning (in milliseconds before timeout)
}

export const useInactivityTimeout = ({
  timeout,
  onTimeout,
  onWarning,
  warningTime = 2 * 60 * 1000 // 2 minutes before timeout
}: UseInactivityTimeoutOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Update last activity
    lastActivityRef.current = Date.now();

    // Set warning timer
    if (onWarning) {
      warningRef.current = setTimeout(() => {
        const timeLeft = timeout - warningTime;
        onWarning(timeLeft);
      }, timeout - warningTime);
    }

    // Set main timeout
    timeoutRef.current = setTimeout(() => {
      console.log('🕐 Inactivity timeout reached - logging out user');
      onTimeout();
    }, timeout);
  }, [timeout, onTimeout, onWarning, warningTime]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    // Start the initial timer
    resetTimer();

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
      
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [handleActivity, resetTimer]);

  return { extendSession };
};
