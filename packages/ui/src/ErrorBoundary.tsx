import React from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: Props) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h1>
            <p className="text-gray-400 mb-4">
              We've been notified and are working to fix the issue.
            </p>
            <details className="mb-8 max-w-md">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300">
                Error details
              </summary>
              <pre className="mt-2 text-xs bg-gray-800 p-4 rounded overflow-auto">
                {errorMessage}
              </pre>
            </details>
            <div className="flex gap-4">
              <button
                onClick={resetError}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        );
      }}
      beforeCapture={(scope) => {
        scope.setTag('errorBoundary', true);
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
} 