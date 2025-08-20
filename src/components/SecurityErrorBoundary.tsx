import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Shield, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isSecurityError: boolean;
}

export class SecurityErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isSecurityError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is a security-related error
    const isSecurityError = this.isSecurityError(error);
    
    return {
      hasError: true,
      error,
      isSecurityError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by SecurityErrorBoundary:', error, errorInfo);
    }

    // Log security errors for monitoring
    if (this.isSecurityError(error)) {
      console.warn('Security-related error detected:', error.message);
      // In production, you might want to send this to a security monitoring service
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  private static isSecurityError(error: Error): boolean {
    const securityKeywords = [
      'security',
      'unauthorized',
      'forbidden',
      'rate limit',
      'malicious',
      'xss',
      'csrf',
      'injection',
      'sanitize',
      'validation'
    ];

    const errorMessage = error.message.toLowerCase();
    return securityKeywords.some(keyword => errorMessage.includes(keyword));
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isSecurityError: false,
    });
  };

  private handleReportIssue = () => {
    // In production, this could open a support ticket or send error details to your team
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    if (import.meta.env.DEV) {
      console.log('Error details for reporting:', errorDetails);
    }

    // You could implement actual error reporting here
    alert('Error has been logged. Please contact support if this persists.');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default security-focused error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full">
              {this.state.isSecurityError ? (
                <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              )}
            </div>

            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {this.state.isSecurityError ? 'Security Alert' : 'Something went wrong'}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {this.state.isSecurityError 
                  ? 'A security-related issue was detected. Please try again or contact support if this persists.'
                  : 'An unexpected error occurred. Please try again.'
                }
              </p>

              {import.meta.env.DEV && this.state.error && (
                <details className="mb-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleReportIssue}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Report Issue
                </button>
              </div>

              {this.state.isSecurityError && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Security Note:</strong> If you believe this is a false positive, 
                    please contact our security team immediately.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SecurityErrorBoundary;

