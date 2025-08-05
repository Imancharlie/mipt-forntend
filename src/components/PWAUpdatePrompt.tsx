import React, { useState, useEffect } from 'react';
import { RefreshCw, X, CheckCircle } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export const PWAUpdatePrompt: React.FC = () => {
  const { theme } = useTheme();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Listen for service worker updates
    const handleUpdateFound = () => {
      setShowUpdatePrompt(true);
    };

    // Check if there's a service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('updatefound', handleUpdateFound);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('updatefound', handleUpdateFound);
      }
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    // Reload the page to apply the update
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <div className={`bg-${theme}-50 border border-${theme}-200 rounded-lg shadow-lg p-4 max-w-sm mx-auto`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 bg-${theme}-100 rounded-lg`}>
            <RefreshCw className={`w-5 h-5 text-${theme}-600 ${isUpdating ? 'animate-spin' : ''}`} />
          </div>
          
          <div className="flex-1">
            <h3 className={`text-sm font-semibold text-${theme}-800 mb-1`}>
              {isUpdating ? 'Updating...' : 'Update Available'}
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              {isUpdating 
                ? 'Installing the latest version...' 
                : 'A new version of MIPT is available. Update now for the latest features and improvements.'
              }
            </p>
            
            {!isUpdating && (
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className={`flex-1 bg-${theme}-600 text-white text-xs font-medium py-2 px-3 rounded-md hover:bg-${theme}-700 transition-colors`}
                >
                  Update Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 