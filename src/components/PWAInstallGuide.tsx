import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Download, X, ChevronDown, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export const PWAInstallGuide: React.FC = () => {
  const { theme } = useTheme();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if app is installed
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
      
      // Check if can install
      const canInstallApp = 'serviceWorker' in navigator && 'PushManager' in window && !isStandalone;
      setCanInstall(canInstallApp);
    };

    checkInstallStatus();
  }, []);

  const installInstructions = [
    {
      id: 'android',
      title: 'Android (Chrome/Edge)',
      icon: <Smartphone className="w-5 h-5" />,
      steps: [
        'Open Chrome or Edge browser',
        'Tap the menu (⋮) in the top right corner',
        'Look for "Add to Home screen" or "Install app"',
        'Tap "Add" or "Install" to confirm',
        'The app will appear on your home screen'
      ],
      tips: [
        'Make sure you\'re using a supported browser',
        'The option may be under "More tools"',
        'You can also use the browser\'s install prompt if available'
      ]
    },
    {
      id: 'ios',
      title: 'iOS (Safari)',
      icon: <Smartphone className="w-5 h-5" />,
      steps: [
        'Open Safari browser (not Chrome)',
        'Tap the Share button (square with arrow)',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to confirm',
        'The app will appear on your home screen'
      ],
      tips: [
        'Must use Safari browser (not Chrome)',
        'The Share button is in the bottom toolbar',
        'You can rename the app before adding'
      ]
    },
    {
      id: 'desktop',
      title: 'Desktop (Chrome/Edge)',
      icon: <Monitor className="w-5 h-5" />,
      steps: [
        'Open Chrome or Edge browser',
        'Look for the install icon (➕) in the address bar',
        'Click "Install" in the popup dialog',
        'The app will be added to your desktop and start menu',
        'You can also access it from the browser\'s app menu'
      ],
      tips: [
        'The install icon appears when the app meets criteria',
        'You can also use Ctrl+Shift+I to open install dialog',
        'The app will work offline once installed'
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  if (isInstalled) {
    return (
      <div className={`card p-4 bg-green-50 border border-green-200`}>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-800">MIPT is Installed!</h3>
        </div>
        <p className="text-sm text-green-700">
          Great! You're using MIPT as a native app. Enjoy the full experience with offline access and quick home screen access.
        </p>
      </div>
    );
  }

  return (
    <div className={`card p-4 bg-${theme}-50 border border-${theme}-200`}>
      <div className="flex items-center gap-2 mb-4">
        <Download className={`w-5 h-5 text-${theme}-500`} />
        <h3 className="text-lg font-semibold text-gray-900">Install MIPT App</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Install MIPT as a Progressive Web App (PWA) for the best experience with offline access, native performance, and quick home screen access.
      </p>

      {!canInstall && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Installation Note</span>
          </div>
          <p className="text-xs text-yellow-700">
            Your browser may not support automatic installation. Follow the manual steps below for your device.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {installInstructions.map((instruction) => (
          <div key={instruction.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(instruction.id)}
              className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${theme}-100 rounded-lg`}>
                  {instruction.icon}
                </div>
                <span className="font-medium text-gray-900">{instruction.title}</span>
              </div>
              {expandedSection === instruction.id ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            {expandedSection === instruction.id && (
              <div className="px-3 pb-3">
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Steps:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    {instruction.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
                
                {instruction.tips && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-xs font-medium text-blue-800 mb-2">Tips:</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      {instruction.tips.map((tip, index) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Benefits of Installing</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 🚀 Native app-like experience with full-screen mode</li>
          <li>• 📱 Quick access from your home screen</li>
          <li>• 🔄 Works offline for basic functionality</li>
          <li>• ⚡ Faster loading times and better performance</li>
          <li>• 🎨 Custom theme colors in browser address bar</li>
          <li>• 📲 Push notifications (when implemented)</li>
          <li>• 💾 Automatic updates in the background</li>
        </ul>
      </div>

      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Troubleshooting</h4>
        <ul className="text-xs text-gray-700 space-y-1">
          <li>• If you don't see the install option, try refreshing the page</li>
          <li>• Make sure you're using a supported browser (Chrome, Edge, Safari)</li>
          <li>• On mobile, ensure you're not in incognito/private mode</li>
          <li>• The app needs to be visited at least twice before install is available</li>
        </ul>
      </div>
    </div>
  );
}; 