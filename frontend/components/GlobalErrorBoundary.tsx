'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // TODO: Log to error tracking service (Sentry, LogRocket, etc.)
    // logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.resetError);
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

interface FallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

function DefaultErrorFallback({ error, errorInfo, onReset }: FallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white border-2 border-red-200 rounded-lg p-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but an unexpected error occurred. Our team has been notified and is working on a fix.
            </p>

            {isDevelopment && error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded p-4">
                <h2 className="font-semibold text-red-900 mb-2">Error Details (Development Only):</h2>
                <p className="text-sm text-red-800 font-mono mb-2">{error.toString()}</p>
                {errorInfo && errorInfo.componentStack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-red-700 hover:text-red-900">
                      Component Stack
                    </summary>
                    <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-64 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <a
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-black hover:bg-gray-50 transition-colors"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </a>
            </div>

            {!isDevelopment && (
              <p className="mt-6 text-sm text-gray-500">
                If this problem persists, please contact support at support@northstar.com
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for handling async errors in functional components
 */
export function useErrorHandler() {
  const [, setError] = React.useState();

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}
