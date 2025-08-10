import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, HelpCircle, Wifi, Server, Database, UserCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: 'network' | 'api' | 'auth' | 'data' | 'unknown';
  suggestedActions: string[];
}

export class SmartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      suggestedActions: []
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Analyze error and determine type
    let errorType: State['errorType'] = 'unknown';
    let suggestedActions: string[] = [];

    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      errorType = 'network';
      suggestedActions = [
        'Check your internet connection',
        'Try refreshing the page',
        'Check if the backend server is running',
        'Contact support if the issue persists'
      ];
    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      errorType = 'auth';
      suggestedActions = [
        'Try logging out and logging back in',
        'Check if your session has expired',
        'Clear browser cookies and try again',
        'Contact support if authentication issues persist'
      ];
    } else if (error.message.includes('404') || error.message.includes('Not Found')) {
      errorType = 'api';
      suggestedActions = [
        'The requested resource may not exist',
        'Try refreshing the page',
        'Check if the URL is correct',
        'Contact support if the issue persists'
      ];
    } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      errorType = 'server';
      suggestedActions = [
        'The server is experiencing issues',
        'Try refreshing the page in a few minutes',
        'Check if the backend service is running',
        'Contact support if the issue persists'
      ];
    } else if (error.message.includes('Cannot read properties') || error.message.includes('undefined')) {
      errorType = 'data';
      suggestedActions = [
        'Data may not be loaded properly',
        'Try refreshing the page',
        'Check if you have the necessary permissions',
        'Contact support if the issue persists'
      ];
    } else {
      suggestedActions = [
        'Try refreshing the page',
        'Clear browser cache and cookies',
        'Check if you have the latest version',
        'Contact support if the issue persists'
      ];
    }

    return {
      hasError: true,
      error,
      errorType,
      suggestedActions
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo
    });

    // Log error to console for debugging
    console.error('SmartErrorBoundary caught an error:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      suggestedActions: []
    });
  };

  getErrorIcon = () => {
    switch (this.state.errorType) {
      case 'network':
        return <Wifi className="w-16 h-16 text-red-500" />;
      case 'auth':
        return <UserCheck className="w-16 h-16 text-yellow-500" />;
      case 'api':
        return <Server className="w-16 h-16 text-blue-500" />;
      case 'data':
        return <Database className="w-16 h-16 text-purple-500" />;
      default:
        return <AlertTriangle className="w-16 h-16 text-red-500" />;
    }
  };

  getErrorTitle = () => {
    switch (this.state.errorType) {
      case 'network':
        return 'Connection Issue';
      case 'auth':
        return 'Authentication Problem';
      case 'api':
        return 'Service Unavailable';
      case 'data':
        return 'Data Loading Error';
      default:
        return 'Something Went Wrong';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            {this.getErrorIcon()}
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
              {this.getErrorTitle()}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We've detected an issue and we're here to help you resolve it.
            </p>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Technical Details (Click to expand)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto">
                  {this.state.error.message}
                </div>
              </details>
            )}

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 text-left">
                Suggested Solutions:
              </h3>
              <ul className="text-left space-y-2">
                {this.state.suggestedActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-green-500 mt-1">•</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <button
                onClick={this.handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Still having issues? Contact our support team for assistance.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
