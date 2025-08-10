import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface SmartLoadingSpinnerProps {
  loading: boolean;
  error?: string | null;
  success?: boolean;
  message?: string;
  timeout?: number; // Timeout in milliseconds
  onRetry?: () => void;
  showProgress?: boolean;
  children?: React.ReactNode;
}

export const SmartLoadingSpinner: React.FC<SmartLoadingSpinnerProps> = ({
  loading,
  error,
  success,
  message = 'Loading...',
  timeout = 30000, // 30 seconds default
  onRetry,
  showProgress = false,
  children
}) => {
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (loading && timeout > 0) {
      const timer = setTimeout(() => {
        setShowTimeoutWarning(true);
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [loading, timeout]);

  useEffect(() => {
    if (loading && showProgress) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return 90; // Don't go to 100% until loading is complete
          return prev + Math.random() * 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else if (!loading) {
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  }, [loading, showProgress]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
          {error}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Success!
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </p>
        {children}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="relative mb-4">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          {showProgress && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {message}
        </h3>
        
        {showProgress && (
          <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {showTimeoutWarning && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This is taking longer than expected. You can:
            </p>
            <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
              <li>• Wait a bit longer</li>
              <li>• Check your internet connection</li>
              <li>• Try refreshing the page</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

// Specialized loading components for common use cases
export const TokenLoadingSpinner: React.FC<{ loading: boolean; error?: string | null }> = ({
  loading,
  error
}) => (
  <SmartLoadingSpinner
    loading={loading}
    error={error}
    message="Fetching your token balance..."
    showProgress={true}
    timeout={15000}
  />
);

export const DataLoadingSpinner: React.FC<{ loading: boolean; error?: string | null; message?: string }> = ({
  loading,
  error,
  message = "Loading data..."
}) => (
  <SmartLoadingSpinner
    loading={loading}
    error={error}
    message={message}
    showProgress={true}
    timeout={20000}
  />
);

export const ActionLoadingSpinner: React.FC<{ loading: boolean; error?: string | null; message?: string }> = ({
  loading,
  error,
  message = "Processing..."
}) => (
  <SmartLoadingSpinner
    loading={loading}
    error={error}
    message={message}
    showProgress={false}
    timeout={10000}
  />
);
