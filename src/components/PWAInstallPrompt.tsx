import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, CheckCircle } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const { theme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
      return isStandalone;
    };

    // Check immediately
    if (checkIfInstalled()) return;

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('PWA: Install prompt available');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay to ensure user has seen the app
      setTimeout(() => {
        if (!hasDismissed && !isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 3000); // Show after 3 seconds
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA: App installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
    };

    // Check for install prompt on page load
    const checkForInstallPrompt = () => {
      // Some browsers don't fire beforeinstallprompt immediately
      // We can check if the app meets install criteria
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        // Show manual install prompt if criteria are met
        setTimeout(() => {
          if (!isInstalled && !hasDismissed && !showInstallPrompt) {
            setShowInstallPrompt(true);
          }
        }, 5000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Check on page load
    checkForInstallPrompt();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled, hasDismissed, showInstallPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback for manual installation
      showManualInstallInstructions();
      return;
    }

    setIsInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallPrompt(false);
      }
    } catch (error) {
      console.error('PWA: Install failed', error);
      showManualInstallInstructions();
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const showManualInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isDesktop = !isIOS && !isAndroid;

    let message = '';
    if (isIOS) {
      message = 'Tap the Share button (square with arrow) and select "Add to Home Screen"';
    } else if (isAndroid) {
      message = 'Tap the menu (⋮) and select "Add to Home screen"';
    } else {
      message = 'Click the install icon (➕) in your browser address bar';
    }

    alert(`To install MIPT:\n\n${message}`);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setHasDismissed(true);
  };

  if (isInstalled) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-3 max-w-sm mx-auto">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-800">MIPT is installed!</span>
          </div>
        </div>
      </div>
    );
  }

  if (!showInstallPrompt || hasDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className={`bg-${theme}-50 border border-${theme}-200 rounded-lg shadow-lg p-4 max-w-sm mx-auto`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 bg-${theme}-100 rounded-lg`}>
            <Download className={`w-5 h-5 text-${theme}-600`} />
          </div>
          
          <div className="flex-1">
            <h3 className={`text-sm font-semibold text-${theme}-800 mb-1`}>
              Install MIPT App
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Get the full native app experience with offline access and quick home screen access.
            </p>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <Smartphone className="w-3 h-3" />
              <span>Works offline • Native experience</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className={`flex-1 bg-${theme}-600 text-white text-xs font-medium py-2 px-3 rounded-md hover:bg-${theme}-700 transition-colors disabled:opacity-50`}
              >
                {isInstalling ? 'Installing...' : 'Install Now'}
              </button>
              <button
                onClick={handleDismiss}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 