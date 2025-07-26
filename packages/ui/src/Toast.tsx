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

interface Props {
  type?: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
}

const types = {
  success: {
    bg: 'bg-green-500',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-500',
    icon: '✕',
  },
  info: {
    bg: 'bg-blue-500',
    icon: 'ℹ',
  },
  warning: {
    bg: 'bg-yellow-500',
    icon: '⚠',
  },
};

export function Toast({ type = 'info', message, onClose }: Props) {
  const { bg, icon } = types[type];

  return (
    <div
      className={`${bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between`}
      role="alert"
    >
      <div className="flex items-center">
        <span className="mr-2">{icon}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
} 