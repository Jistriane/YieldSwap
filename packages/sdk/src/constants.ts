/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


export const NETWORKS = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
} as const;

export const ASSETS = {
  XLM: 'native',
  USDC: 'USDC',
  EURC: 'EURC',
} as const;

export const DEFAULT_SLIPPAGE = 0.5; // 0.5%
export const MAX_SLIPPAGE = 5; // 5%
export const MIN_AMOUNT = '0.0000001';
export const DEFAULT_TIMEOUT = 10000; // 10s
export const DEFAULT_RETRY_DELAY = 1000; // 1s
export const DEFAULT_MAX_RETRIES = 3;

export const ERROR_CODES = {
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  INVALID_SLIPPAGE: 'INVALID_SLIPPAGE',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  USER_REJECTED: 'USER_REJECTED',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const; 