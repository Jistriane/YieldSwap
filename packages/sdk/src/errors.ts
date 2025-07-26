/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import { ERROR_CODES } from './constants';

export class YieldSwapError extends Error {
  constructor(
    public code: keyof typeof ERROR_CODES,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'YieldSwapError';
  }
}

export class WalletNotConnectedError extends YieldSwapError {
  constructor(message = 'Wallet not connected') {
    super(ERROR_CODES.WALLET_NOT_CONNECTED, message);
    this.name = 'WalletNotConnectedError';
  }
}

export class InsufficientBalanceError extends YieldSwapError {
  constructor(message = 'Insufficient balance') {
    super(ERROR_CODES.INSUFFICIENT_BALANCE, message);
    this.name = 'InsufficientBalanceError';
  }
}

export class InvalidAmountError extends YieldSwapError {
  constructor(message = 'Invalid amount') {
    super(ERROR_CODES.INVALID_AMOUNT, message);
    this.name = 'InvalidAmountError';
  }
}

export class InvalidAddressError extends YieldSwapError {
  constructor(message = 'Invalid address') {
    super(ERROR_CODES.INVALID_ADDRESS, message);
    this.name = 'InvalidAddressError';
  }
}

export class InvalidSlippageError extends YieldSwapError {
  constructor(message = 'Invalid slippage') {
    super(ERROR_CODES.INVALID_SLIPPAGE, message);
    this.name = 'InvalidSlippageError';
  }
}

export class TransactionFailedError extends YieldSwapError {
  constructor(message = 'Transaction failed', details?: unknown) {
    super(ERROR_CODES.TRANSACTION_FAILED, message, details);
    this.name = 'TransactionFailedError';
  }
}

export class UserRejectedError extends YieldSwapError {
  constructor(message = 'User rejected') {
    super(ERROR_CODES.USER_REJECTED, message);
    this.name = 'UserRejectedError';
  }
}

export class NetworkError extends YieldSwapError {
  constructor(message = 'Network error', details?: unknown) {
    super(ERROR_CODES.NETWORK_ERROR, message, details);
    this.name = 'NetworkError';
  }
} 