import { useState } from 'react';

/**
 * Configuração da Stellar Testnet
 */

export const STELLAR_CONFIG = {
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
  rpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
  horizonUrl: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  passphrase: process.env.NEXT_PUBLIC_STELLAR_PASSPHRASE || 'Test SDF Network ; September 2015',
  contractId: process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID || '',
} as const;

export const FREIGHTER_CONFIG = {
  network: process.env.NEXT_PUBLIC_FREIGHTER_NETWORK || 'testnet',
} as const;

/**
 * Tipos para a integração Stellar
 */
export interface StellarAccount {
  publicKey: string;
  balance: string;
}

export interface SwapParams {
  fromAsset: string;
  toAsset: string;
  amount: string;
  slippage: number;
}

/**
 * Utilitários para Stellar
 */
export class StellarUtils {
  /**
   * Conecta com a carteira Freighter
   */
  static async connectWallet(): Promise<StellarAccount | null> {
    try {
      // Verifica se o Freighter está disponível
      if (typeof window === 'undefined' || !window.freighter) {
        throw new Error('Freighter wallet not found');
      }

      // Solicita conexão
      const { publicKey } = await window.freighter.requestAccess();
      
      if (!publicKey) {
        throw new Error('Failed to get public key');
      }

      // Busca o saldo (simulado para testnet)
      const balance = await this.getAccountBalance(publicKey);

      return {
        publicKey,
        balance,
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    }
  }

  /**
   * Busca o saldo da conta (simulado)
   */
  static async getAccountBalance(publicKey: string): Promise<string> {
    try {
      // Em produção, aqui faria uma chamada real para o Horizon
      // Por enquanto, retorna um valor simulado
      return '1000.0000000';
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0.0000000';
    }
  }

  /**
   * Executa um swap (simulado)
   */
  static async executeSwap(params: SwapParams): Promise<string> {
    try {
      // Simula delay de transação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Retorna hash de transação simulado
      return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    } catch (error) {
      console.error('Error executing swap:', error);
      throw error;
    }
  }

  /**
   * Formata endereço da carteira para exibição
   */
  static formatAddress(address: string, startChars = 6, endChars = 4): string {
    if (!address || address.length < startChars + endChars) {
      return address;
    }
    
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  }

  /**
   * Valida se um endereço Stellar é válido
   */
  static isValidStellarAddress(address: string): boolean {
    // Validação básica de endereço Stellar
    const stellarAddressRegex = /^G[A-Z2-7]{55}$/;
    return stellarAddressRegex.test(address);
  }
}

/**
 * Hook personalizado para gerenciar conexão da carteira
 */
export const useStellarWallet = () => {
  const [account, setAccount] = useState<StellarAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const account = await StellarUtils.connectWallet();
      setAccount(account);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setError(null);
  };

  return {
    account,
    isConnecting,
    error,
    connect,
    disconnect,
    isConnected: !!account,
  };
};

// Declaração de tipos para Freighter
declare global {
  interface Window {
    freighter?: {
      requestAccess(): Promise<{ publicKey: string }>;
      signTransaction(xdr: string): Promise<{ signedXDR: string }>;
      getNetwork(): Promise<{ network: string }>;
    };
  }
} 