/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import { useState, useCallback, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { 
  swapStateAtom, 
  walletStateAtom, 
  transactionStateAtom,
  addTransactionAtom,
  updateTransactionAtom,
  portfolioStateAtom,
  updatePortfolioAtom
} from '../lib/atoms';
import { useWallet } from './useWallet';
import { useRoute } from './useRoute';

export interface SwapParams {
  fromAsset: string;
  toAsset: string;
  amount: string;
  slippage?: number;
  deadline?: number;
}

export interface StakeParams {
  asset: string;
  amount: string;
  duration?: number; // in days
  autoCompound?: boolean;
}

export interface UnstakeParams {
  asset: string;
  amount: string;
  immediate?: boolean;
}

export interface ClaimParams {
  asset: string;
  rewardType: 'swap' | 'stake' | 'liquidity' | 'all';
}

export interface YieldOpportunity {
  asset: string;
  protocol: string;
  apy: number;
  tvl: number;
  risk: 'low' | 'medium' | 'high';
  lockPeriod: number; // in days
  minimumDeposit: string;
  fees: {
    deposit: number;
    withdrawal: number;
    performance: number;
  };
  rewards: {
    token: string;
    dailyRate: number;
    compounding: boolean;
  };
  features: string[];
}

export interface Portfolio {
  totalValue: number;
  totalRewards: number;
  positions: Array<{
    asset: string;
    amount: string;
    value: number;
    apy: number;
    rewards: {
      pending: string;
      claimed: string;
    };
    lockUntil?: Date;
    autoCompound: boolean;
  }>;
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    allTime: number;
  };
}

export interface UseSwapAndEarnReturn {
  // Swap functionality
  swap: (params: SwapParams) => Promise<string | null>;
  isSwapping: boolean;
  swapError: string | null;
  
  // Staking functionality
  stake: (params: StakeParams) => Promise<string | null>;
  unstake: (params: UnstakeParams) => Promise<string | null>;
  isStaking: boolean;
  stakingError: string | null;
  
  // Rewards functionality
  claimRewards: (params: ClaimParams) => Promise<string | null>;
  isClaiming: boolean;
  claimingError: string | null;
  
  // Yield opportunities
  yieldOpportunities: YieldOpportunity[];
  loadYieldOpportunities: () => Promise<void>;
  isLoadingOpportunities: boolean;
  
  // Portfolio management
  portfolio: Portfolio | null;
  refreshPortfolio: () => Promise<void>;
  isLoadingPortfolio: boolean;
  
  // Analytics
  estimateRewards: (asset: string, amount: string, duration: number) => Promise<{
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  }>;
  
  // Utility functions
  calculateOptimalPath: (fromAsset: string, toAsset: string, amount: string) => Promise<{
    directSwap: number;
    swapAndStake: number;
    recommended: 'direct' | 'stake';
  }>;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

const SUPPORTED_ASSETS = [
  'XLM', 'USDC', 'USDT', 'BTC', 'ETH', 'AQUA', 'YBX'
];

const YIELD_PROTOCOLS = [
  'stellar-yield', 'aquarius', 'ultra-stellar', 'soroswap'
];

export const useSwapAndEarn = (): UseSwapAndEarnReturn => {
  const [swapState, updateSwap] = useAtom(swapStateAtom);
  const [walletState] = useAtom(walletStateAtom);
  const [, addTransaction] = useAtom(addTransactionAtom);
  const [, updateTransaction] = useAtom(updateTransactionAtom);
  const [portfolioState, updatePortfolio] = useAtom(portfolioStateAtom);
  
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [isStaking, setIsStaking] = useState(false);
  const [stakingError, setStakingError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimingError, setClaimingError] = useState<string | null>(null);
  const [yieldOpportunities, setYieldOpportunities] = useState<YieldOpportunity[]>([]);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const { signTransaction, connected: isConnected } = useWallet();
  const { findRoute } = useRoute();
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Swap functionality
  const swap = useCallback(async (params: SwapParams): Promise<string | null> => {
    if (!isConnected || !walletState.address) {
      setSwapError('Wallet not connected');
      return null;
    }

    setIsSwapping(true);
    setSwapError(null);

    try {
      // Find optimal route
      const route = await findRoute(params.fromAsset, params.toAsset, params.amount);
      
      if (!route) {
        throw new Error('No route found for swap');
      }

      // Prepare transaction
      const txParams = {
        fromAsset: params.fromAsset,
        toAsset: params.toAsset,
        amount: params.amount,
        minAmountOut: route.outputAmount,
        slippage: params.slippage || 0.5,
        deadline: params.deadline || 20,
        route: route.path,
      };

      const response = await fetch('/api/swap/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(txParams),
      });

      if (!response.ok) {
        throw new Error(`Failed to prepare swap: ${response.statusText}`);
      }

      const { xdr } = await response.json();

      // Sign transaction
      const signedXdr = await signTransaction(xdr);
      
      if (!signedXdr) {
        throw new Error('Transaction signing failed');
      }

      // Submit transaction
      const submitResponse = await fetch('/api/swap/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xdr: signedXdr }),
      });

      if (!submitResponse.ok) {
        throw new Error(`Failed to submit swap: ${submitResponse.statusText}`);
      }

      const { hash } = await submitResponse.json();

      // Add to pending transactions
      addTransaction({
        id: hash,
        type: 'swap',
        status: 'pending',
        hash,
        timestamp: new Date(),
        details: {
          fromAsset: params.fromAsset,
          toAsset: params.toAsset,
          amount: params.amount,
          expectedOutput: route.outputAmount,
        },
      });

      // Monitor transaction
      monitorTransaction(hash);

      setIsSwapping(false);
      return hash;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Swap failed';
      setSwapError(errorMessage);
      setIsSwapping(false);
      console.error('Swap error:', err);
      return null;
    }
  }, [isConnected, walletState.address, findRoute, signTransaction, addTransaction]);

  // Staking functionality
  const stake = useCallback(async (params: StakeParams): Promise<string | null> => {
    if (!isConnected || !walletState.address) {
      setStakingError('Wallet not connected');
      return null;
    }

    setIsStaking(true);
    setStakingError(null);

    try {
      const response = await fetch('/api/stake/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Failed to prepare stake: ${response.statusText}`);
      }

      const { xdr } = await response.json();
      const signedXdr = await signTransaction(xdr);
      
      if (!signedXdr) {
        throw new Error('Transaction signing failed');
      }

      const submitResponse = await fetch('/api/stake/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xdr: signedXdr }),
      });

      if (!submitResponse.ok) {
        throw new Error(`Failed to submit stake: ${submitResponse.statusText}`);
      }

      const { hash } = await submitResponse.json();

      addTransaction({
        id: hash,
        type: 'stake',
        status: 'pending',
        hash,
        timestamp: new Date(),
        details: params,
      });

      monitorTransaction(hash);

      setIsStaking(false);
      return hash;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Staking failed';
      setStakingError(errorMessage);
      setIsStaking(false);
      console.error('Staking error:', err);
      return null;
    }
  }, [isConnected, walletState.address, signTransaction, addTransaction]);

  // Unstaking functionality
  const unstake = useCallback(async (params: UnstakeParams): Promise<string | null> => {
    if (!isConnected || !walletState.address) {
      setStakingError('Wallet not connected');
      return null;
    }

    setIsStaking(true);
    setStakingError(null);

    try {
      const response = await fetch('/api/unstake/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Failed to prepare unstake: ${response.statusText}`);
      }

      const { xdr } = await response.json();
      const signedXdr = await signTransaction(xdr);
      
      if (!signedXdr) {
        throw new Error('Transaction signing failed');
      }

      const submitResponse = await fetch('/api/unstake/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xdr: signedXdr }),
      });

      if (!submitResponse.ok) {
        throw new Error(`Failed to submit unstake: ${submitResponse.statusText}`);
      }

      const { hash } = await submitResponse.json();

      addTransaction({
        id: hash,
        type: 'unstake',
        status: 'pending',
        hash,
        timestamp: new Date(),
        details: params,
      });

      monitorTransaction(hash);

      setIsStaking(false);
      return hash;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Unstaking failed';
      setStakingError(errorMessage);
      setIsStaking(false);
      console.error('Unstaking error:', err);
      return null;
    }
  }, [isConnected, walletState.address, signTransaction, addTransaction]);

  // Claim rewards functionality
  const claimRewards = useCallback(async (params: ClaimParams): Promise<string | null> => {
    if (!isConnected || !walletState.address) {
      setClaimingError('Wallet not connected');
      return null;
    }

    setIsClaiming(true);
    setClaimingError(null);

    try {
      const response = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Failed to claim rewards: ${response.statusText}`);
      }

      const { xdr } = await response.json();
      const signedXdr = await signTransaction(xdr);
      
      if (!signedXdr) {
        throw new Error('Transaction signing failed');
      }

      const submitResponse = await fetch('/api/rewards/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xdr: signedXdr }),
      });

      if (!submitResponse.ok) {
        throw new Error(`Failed to submit claim: ${submitResponse.statusText}`);
      }

      const { hash } = await submitResponse.json();

      addTransaction({
        id: hash,
        type: 'claim',
        status: 'pending',
        hash,
        timestamp: new Date(),
        details: params,
      });

      monitorTransaction(hash);

      setIsClaiming(false);
      return hash;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Claiming failed';
      setClaimingError(errorMessage);
      setIsClaiming(false);
      console.error('Claiming error:', err);
      return null;
    }
  }, [isConnected, walletState.address, signTransaction, addTransaction]);

  // Load yield opportunities
  const loadYieldOpportunities = useCallback(async (): Promise<void> => {
    setIsLoadingOpportunities(true);

    try {
      const response = await fetch('/api/yield/opportunities');
      
      if (!response.ok) {
        throw new Error(`Failed to load opportunities: ${response.statusText}`);
      }

      const data = await response.json();
      setYieldOpportunities(data);
    } catch (err: any) {
      console.error('Failed to load yield opportunities:', err);
    } finally {
      setIsLoadingOpportunities(false);
    }
  }, []);

  // Refresh portfolio
  const refreshPortfolio = useCallback(async (): Promise<void> => {
    if (!isConnected || !walletState.address) return;

    setIsLoadingPortfolio(true);

    try {
      const response = await fetch(`/api/portfolio/${walletState.address}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load portfolio: ${response.statusText}`);
      }

      const data = await response.json();
      setPortfolio(data);
      
      updatePortfolio({
        totalValue: data.totalValue,
        totalChange24h: data.performance.daily,
        allocations: data.positions,
        performance: data.performance,
        transactions: portfolioState.transactions,
        lastUpdate: new Date(),
      });

      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Failed to refresh portfolio:', err);
    } finally {
      setIsLoadingPortfolio(false);
    }
  }, [isConnected, walletState.address, updatePortfolio]);

  // Estimate rewards
  const estimateRewards = useCallback(async (
    asset: string, 
    amount: string, 
    duration: number
  ): Promise<{
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  }> => {
    try {
      const response = await fetch('/api/rewards/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asset, amount, duration }),
      });

      if (!response.ok) {
        throw new Error(`Failed to estimate rewards: ${response.statusText}`);
      }

      return await response.json();
    } catch (err: any) {
      console.error('Failed to estimate rewards:', err);
      return { daily: 0, weekly: 0, monthly: 0, yearly: 0 };
    }
  }, []);

  // Calculate optimal path
  const calculateOptimalPath = useCallback(async (
    fromAsset: string, 
    toAsset: string, 
    amount: string
  ): Promise<{
    directSwap: number;
    swapAndStake: number;
    recommended: 'direct' | 'stake';
  }> => {
    try {
      const response = await fetch('/api/optimize/path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fromAsset, toAsset, amount }),
      });

      if (!response.ok) {
        throw new Error(`Failed to calculate optimal path: ${response.statusText}`);
      }

      return await response.json();
    } catch (err: any) {
      console.error('Failed to calculate optimal path:', err);
      return {
        directSwap: 0,
        swapAndStake: 0,
        recommended: 'direct',
      };
    }
  }, []);

  // Monitor transaction status
  const monitorTransaction = useCallback(async (hash: string): Promise<void> => {
    const maxAttempts = 30;
    let attempts = 0;

    const checkStatus = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/transaction/${hash}`);
        
        if (!response.ok) {
          throw new Error(`Failed to check transaction: ${response.statusText}`);
        }

        const { status, details } = await response.json();

        if (status === 'confirmed' || status === 'failed') {
          updateTransaction({ id: hash, status, details });
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000); // Check every 2 seconds
        } else {
          updateTransaction({ 
            id: hash, 
            status: 'failed', 
            details: { error: 'Transaction timeout' } 
          });
        }
      } catch (err: any) {
        console.error(`Failed to monitor transaction ${hash}:`, err);
        updateTransaction({ 
          id: hash, 
          status: 'failed', 
          details: { error: err.message } 
        });
      }
    };

    checkStatus();
  }, [updateTransaction]);

  // Load initial data
  useEffect(() => {
    loadYieldOpportunities();
    if (isConnected) {
      refreshPortfolio();
    }
  }, [isConnected, loadYieldOpportunities, refreshPortfolio]);

  // Auto-refresh portfolio
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      refreshPortfolio();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [isConnected, refreshPortfolio]);

  const isLoading = isSwapping || isStaking || isClaiming || isLoadingOpportunities || isLoadingPortfolio;
  const error = swapError || stakingError || claimingError;

  return {
    // Swap functionality
    swap,
    isSwapping,
    swapError,
    
    // Staking functionality
    stake,
    unstake,
    isStaking,
    stakingError,
    
    // Rewards functionality
    claimRewards,
    isClaiming,
    claimingError,
    
    // Yield opportunities
    yieldOpportunities,
    loadYieldOpportunities,
    isLoadingOpportunities,
    
    // Portfolio management
    portfolio,
    refreshPortfolio,
    isLoadingPortfolio,
    
    // Analytics
    estimateRewards,
    calculateOptimalPath,
    
    // State
    isLoading,
    error,
    lastUpdate,
  };
}; 