import React from 'react';

interface LoadingProps {
  type?: 'spinner' | 'skeleton';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Loading({ type = 'spinner', width = '100%', height = '24px', className = '' }: LoadingProps) {
  if (type === 'skeleton') {
    return (
      <div
        className={`animate-pulse bg-gray-700 rounded-md ${className}`}
        style={{ width, height }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500" />
    </div>
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 1, className = '' }: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Loading key={i} type="skeleton" height="1rem" />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`bg-gray-800 rounded-lg p-4 space-y-4 ${className}`}>
      <Loading type="skeleton" height="2rem" />
      <SkeletonText lines={3} />
      <Loading type="skeleton" height="3rem" />
    </div>
  );
} 