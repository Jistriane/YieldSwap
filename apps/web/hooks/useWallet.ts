import { useState, useEffect } from 'react';

interface WalletState {
  connected: boolean;
  address: string | null;
  isConnecting: boolean;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    isConnecting: false,
  });

  const connect = async () => {
    setWallet(prev => ({ ...prev, isConnecting: true }));
    
    try {
      // Simular conexão com Freighter
      if (typeof window !== 'undefined' && (window as any).freighter) {
        const { publicKey } = await (window as any).freighter.getPublicKey();
        setWallet({
          connected: true,
          address: publicKey,
          isConnecting: false,
        });
      } else {
        // Simular endereço para demonstração
        const mockAddress = 'GCKFBEIYTKP6RCZX6LRQW7OQHDBADI4HQBR5HFKJQX7WVHEKFZQ2LTBM';
        setWallet({
          connected: true,
          address: mockAddress,
          isConnecting: false,
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setWallet(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnect = () => {
    setWallet({
      connected: false,
      address: null,
      isConnecting: false,
    });
  };

  const signTransaction = async (xdr: string, options?: any) => {
    if (typeof window !== 'undefined' && (window as any).freighter) {
      return await (window as any).freighter.signTransaction(xdr, options);
    }
    // Mock para desenvolvimento
    return xdr;
  };

  return {
    ...wallet,
    connect,
    disconnect,
    signTransaction,
  };
} 