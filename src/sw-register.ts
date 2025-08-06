// Service Worker Registration for PWA
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available
                  console.log('New content is available');
                }
              });
            }
          });
          
          // Force update check for Netlify
          registration.update();
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// Check if app is installed
export function isAppInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// Check if app meets install criteria
export function canInstallApp(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    !isAppInstalled()
  );
}

// Let browser handle install prompt natively
export function getInstallPrompt(): Promise<Event | null> {
  return Promise.resolve(null); // Disable custom install prompt
} 