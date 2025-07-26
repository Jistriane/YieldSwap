/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import React from 'react';

interface LoadingProps {
  type?: 'spinner' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function Loading({ 
  type = 'spinner', 
  size = 'md', 
  width, 
  height, 
  className = '' 
}: LoadingProps) {
  if (type === 'skeleton') {
    return (
      <div
        className={`animate-pulse bg-gray-300 rounded ${className}`}
        style={{ 
          width: width || '100%', 
          height: height || '20px' 
        }}
      />
    );
  }

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}
      style={{ 
        width: width || undefined, 
        height: height || undefined 
      }}
    />
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

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-800 rounded-lg p-6 animate-pulse ${className}`}>
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-full"></div>
    </div>
  );
} 