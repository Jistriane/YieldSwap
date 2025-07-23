import React from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: Props) {
  return (
    <Sentry.ErrorBoundary
      fallback={
        fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h1>
            <p className="text-gray-400 mb-8">
              We've been notified and are working to fix the issue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        )
      }
    >
      {children}
    </Sentry.ErrorBoundary>
  );
} 