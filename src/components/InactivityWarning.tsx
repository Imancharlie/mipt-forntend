import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { AlertTriangle, X } from 'lucide-react';

interface InactivityWarningProps {
  onStayActive: () => void;
  onLogout: () => void;
  timeLeft: number;
}

export const InactivityWarning: React.FC<InactivityWarningProps> = ({
  onStayActive,
  onLogout,
  timeLeft
}) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show warning when there's 2 minutes left
    if (timeLeft <= 2 * 60 * 1000 && timeLeft > 0) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [timeLeft]);

  if (!isVisible) return null;

  const minutesLeft = Math.ceil(timeLeft / (60 * 1000));

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 text-blue-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-blue-800">
              Session Timeout Warning
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              You'll be logged out in {minutesLeft} minute{minutesLeft !== 1 ? 's' : ''} due to inactivity.
            </p>
            
            <div className="mt-3 flex gap-2">
              <button
                onClick={onStayActive}
                className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Stay Active
              </button>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 text-xs font-medium bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Logout Now
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
