import React, { useEffect } from 'react';
import { X, AlertCircle, Info } from 'lucide-react';
import { useAppStore } from '@/store';


export const ToastContainer: React.FC = () => {
  const { error, clearError } = useAppStore();


  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  const getIcon = () => {
    switch (error.type) {
      case 'auth':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'network':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'validation':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getBgColor = () => {
    switch (error.type) {
      case 'auth':
        return 'bg-red-50 border-red-200';
      case 'network':
        return 'bg-yellow-50 border-yellow-200';
      case 'validation':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
      <div className={`max-w-md mx-auto ${getBgColor()} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {error.message}
            </p>
            
            {error.field && (
              <p className="text-xs text-gray-600 mt-1">
                Field: {error.field}
              </p>
            )}
            
            {error.retry && (
              <button
                onClick={error.retry}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2"
              >
                Try Again
              </button>
            )}
          </div>
          
          <button
            onClick={clearError}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}; 