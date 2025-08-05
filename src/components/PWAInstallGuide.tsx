import React, { useState } from 'react';
import { Smartphone, Monitor, Download, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export const PWAInstallGuide: React.FC = () => {
  const { theme } = useTheme();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const installInstructions = [
    {
      id: 'android',
      title: 'Android (Chrome)',
      icon: <Smartphone className="w-5 h-5" />,
      steps: [
        'Open Chrome browser',
        'Tap the menu (⋮) in the top right',
        'Tap "Add to Home screen" or "Install app"',
        'Tap "Add" to confirm'
      ]
    },
    {
      id: 'ios',
      title: 'iOS (Safari)',
      icon: <Smartphone className="w-5 h-5" />,
      steps: [
        'Open Safari browser',
        'Tap the Share button (square with arrow)',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to confirm'
      ]
    },
    {
      id: 'desktop',
      title: 'Desktop (Chrome/Edge)',
      icon: <Monitor className="w-5 h-5" />,
      steps: [
        'Open Chrome or Edge browser',
        'Click the install icon (➕) in the address bar',
        'Click "Install" in the popup',
        'The app will be added to your desktop'
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className={`card p-4 bg-${theme}-50 border border-${theme}-200`}>
      <div className="flex items-center gap-2 mb-4">
        <Download className={`w-5 h-5 text-${theme}-500`} />
        <h3 className="text-lg font-semibold text-gray-900">Install MIPT App</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Install MIPT as a Progressive Web App (PWA) on your device for quick access and offline functionality.
      </p>

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
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  {instruction.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Benefits of Installing</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Quick access from your home screen</li>
          <li>• Works offline for basic functionality</li>
          <li>• Faster loading times</li>
          <li>• Native app-like experience</li>
        </ul>
      </div>
    </div>
  );
}; 