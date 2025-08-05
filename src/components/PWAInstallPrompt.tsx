import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
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

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (isInstalled || !showInstallPrompt) {
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
              Install this app on your device for quick and easy access when you're on the go.
            </p>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <Smartphone className="w-3 h-3" />
              <span>Available on mobile devices</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className={`flex-1 bg-${theme}-600 text-white text-xs font-medium py-2 px-3 rounded-md hover:bg-${theme}-700 transition-colors`}
              >
                Install
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