import { atom } from 'jotai';

// APY Data Types
export interface ApyData {
  asset: string;
  apy: number;
  tvl: number;
  volume24h: number;
  change24h: number;
  lastUpdate: Date;
  trend: 'up' | 'down' | 'stable';
  historical: Array<{
    timestamp: Date;
    apy: number;
    tvl: number;
  }>;
  risk: 'low' | 'medium' | 'high';
  liquidity: number;
  fees: {
    swap: number;
    withdrawal: number;
  };
  rewards: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  metrics: {
    sharpeRatio: number;
    volatility: number;
    maxDrawdown: number;
  };
}

// Route Data Types
export interface RouteStep {
  protocol: string;
  pool: string;
  asset: string;
  fee: number;
  priceImpact: number;
  liquidity: number;
}

export interface RouteData {
  path: RouteStep[];
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  slippage: number;
  estimatedGas: number;
  executionTime: number;
  confidence: number;
  risks: Array<{
    type: 'liquidity' | 'slippage' | 'price' | 'gas';
    level: 'low' | 'medium' | 'high';
    description: string;
  }>;
  alternatives: Array<{
    path: RouteStep[];
    outputAmount: string;
    priceImpact: number;
    score: number;
    estimatedGas: number;
    confidence: number;
  }>;
  metadata: {
    timestamp: Date;
    blockNumber: number;
    validUntil: Date;
    source: string;
  };
}

// Wallet State Types
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  publicKey: string | null;
  network: 'mainnet' | 'testnet';
  balance: {
    native: string;
    tokens: Array<{
      asset: string;
      balance: string;
      symbol: string;
      decimals: number;
    }>;
  };
  permissions: string[];
  lastActivity: Date | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

// User Settings Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'pt' | 'es';
  currency: 'USD' | 'BRL' | 'EUR';
  slippageTolerance: number;
  gasPrice: 'slow' | 'standard' | 'fast' | 'custom';
  customGasPrice?: number;
  notifications: {
    priceAlerts: boolean;
    transactionUpdates: boolean;
    newFeatures: boolean;
    marketing: boolean;
  };
  privacy: {
    analyticsEnabled: boolean;
    crashReportsEnabled: boolean;
    performanceDataEnabled: boolean;
  };
  advanced: {
    expertMode: boolean;
    debugMode: boolean;
    showTestnets: boolean;
    customRpcUrl?: string;
  };
}

// Transaction State Types
export interface TransactionState {
  pending: Array<{
    id: string;
    type: 'swap' | 'stake' | 'unstake' | 'claim';
    status: 'pending' | 'confirmed' | 'failed';
    hash: string;
    timestamp: Date;
    details: any;
  }>;
  history: Array<{
    id: string;
    type: 'swap' | 'stake' | 'unstake' | 'claim';
    status: 'confirmed' | 'failed';
    hash: string;
    timestamp: Date;
    details: any;
    gasUsed: number;
    gasPrice: string;
  }>;
  lastUpdate: Date | null;
}

// Swap State Types
export interface SwapState {
  fromAsset: string;
  toAsset: string;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  deadline: number;
  isExactIn: boolean;
  route: RouteData | null;
  isLoading: boolean;
  error: string | null;
  lastQuoteTime: Date | null;
  priceImpactWarning: boolean;
  minimumReceived: string;
  maxSold: string;
}

// Market Data Types
export interface MarketData {
  prices: Record<string, {
    usd: number;
    change24h: number;
    marketCap: number;
    volume24h: number;
    lastUpdate: Date;
  }>;
  trending: Array<{
    asset: string;
    change24h: number;
    volume24h: number;
    rank: number;
  }>;
  news: Array<{
    id: string;
    title: string;
    summary: string;
    url: string;
    timestamp: Date;
    source: string;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
}

// Portfolio State Types
export interface PortfolioState {
  totalValue: number;
  totalChange24h: number;
  allocations: Array<{
    asset: string;
    amount: string;
    value: number;
    percentage: number;
    apy: number;
    rewards: {
      pending: string;
      claimed: string;
    };
  }>;
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    allTime: number;
  };
  transactions: TransactionState['history'];
  lastUpdate: Date | null;
}

// Global Atoms
export const apyDataAtom = atom<ApyData[]>([]);

export const routeDataAtom = atom<RouteData | null>(null);

export const walletStateAtom = atom<WalletState>({
  isConnected: false,
  address: null,
  publicKey: null,
  network: 'testnet',
  balance: {
    native: '0',
    tokens: [],
  },
  permissions: [],
  lastActivity: null,
  connectionStatus: 'disconnected',
});

export const userSettingsAtom = atom<UserSettings>({
  theme: 'system',
  language: 'pt',
  currency: 'USD',
  slippageTolerance: 0.5,
  gasPrice: 'standard',
  notifications: {
    priceAlerts: true,
    transactionUpdates: true,
    newFeatures: true,
    marketing: false,
  },
  privacy: {
    analyticsEnabled: true,
    crashReportsEnabled: true,
    performanceDataEnabled: true,
  },
  advanced: {
    expertMode: false,
    debugMode: false,
    showTestnets: true,
  },
});

export const transactionStateAtom = atom<TransactionState>({
  pending: [],
  history: [],
  lastUpdate: null,
});

export const swapStateAtom = atom<SwapState>({
  fromAsset: '',
  toAsset: '',
  fromAmount: '',
  toAmount: '',
  slippage: 0.5,
  deadline: 20,
  isExactIn: true,
  route: null,
  isLoading: false,
  error: null,
  lastQuoteTime: null,
  priceImpactWarning: false,
  minimumReceived: '0',
  maxSold: '0',
});

export const marketDataAtom = atom<MarketData>({
  prices: {},
  trending: [],
  news: [],
});

export const portfolioStateAtom = atom<PortfolioState>({
  totalValue: 0,
  totalChange24h: 0,
  allocations: [],
  performance: {
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    allTime: 0,
  },
  transactions: [],
  lastUpdate: null,
});

// Derived Atoms
export const isWalletConnectedAtom = atom(
  (get) => get(walletStateAtom).isConnected
);

export const currentNetworkAtom = atom(
  (get) => get(walletStateAtom).network
);

export const userBalanceAtom = atom(
  (get) => get(walletStateAtom).balance
);

export const swapFormValidAtom = atom(
  (get) => {
    const swap = get(swapStateAtom);
    return swap.fromAsset && 
           swap.toAsset && 
           swap.fromAmount && 
           parseFloat(swap.fromAmount) > 0;
  }
);

export const portfolioTotalValueAtom = atom(
  (get) => get(portfolioStateAtom).totalValue
);

export const pendingTransactionsAtom = atom(
  (get) => get(transactionStateAtom).pending
);

export const recentTransactionsAtom = atom(
  (get) => get(transactionStateAtom).history.slice(0, 10)
);

// Action Atoms
export const connectWalletAtom = atom(
  null,
  (get, set, walletData: Partial<WalletState>) => {
    const current = get(walletStateAtom);
    set(walletStateAtom, {
      ...current,
      ...walletData,
      isConnected: true,
      connectionStatus: 'connected',
      lastActivity: new Date(),
    });
  }
);

export const disconnectWalletAtom = atom(
  null,
  (get, set) => {
    set(walletStateAtom, {
      isConnected: false,
      address: null,
      publicKey: null,
      network: 'testnet',
      balance: {
        native: '0',
        tokens: [],
      },
      permissions: [],
      lastActivity: null,
      connectionStatus: 'disconnected',
    });
  }
);

export const updateSwapAtom = atom(
  null,
  (get, set, update: Partial<SwapState>) => {
    const current = get(swapStateAtom);
    set(swapStateAtom, {
      ...current,
      ...update,
    });
  }
);

export const addTransactionAtom = atom(
  null,
  (get, set, transaction: TransactionState['pending'][0]) => {
    const current = get(transactionStateAtom);
    set(transactionStateAtom, {
      ...current,
      pending: [...current.pending, transaction],
      lastUpdate: new Date(),
    });
  }
);

export const updateTransactionAtom = atom(
  null,
  (get, set, { id, status, details }: { id: string; status: string; details?: any }) => {
    const current = get(transactionStateAtom);
    const pendingIndex = current.pending.findIndex(tx => tx.id === id);
    
    if (pendingIndex !== -1) {
      const transaction = current.pending[pendingIndex];
      const updatedPending = current.pending.filter(tx => tx.id !== id);
      
      if (status === 'confirmed' || status === 'failed') {
        // Move to history
        const historyTransaction = {
          ...transaction,
          status: status as 'confirmed' | 'failed',
          details: details || transaction.details,
          gasUsed: details?.gasUsed || 0,
          gasPrice: details?.gasPrice || '0',
        };
        
        set(transactionStateAtom, {
          pending: updatedPending,
          history: [historyTransaction, ...current.history],
          lastUpdate: new Date(),
        });
      } else {
        // Update pending
        const updatedTransaction = {
          ...transaction,
          status: status as 'pending',
          details: details || transaction.details,
        };
        
        set(transactionStateAtom, {
          ...current,
          pending: [...updatedPending, updatedTransaction],
          lastUpdate: new Date(),
        });
      }
    }
  }
);

export const updateUserSettingsAtom = atom(
  null,
  (get, set, settings: Partial<UserSettings>) => {
    const current = get(userSettingsAtom);
    set(userSettingsAtom, {
      ...current,
      ...settings,
    });
  }
);

export const updatePortfolioAtom = atom(
  null,
  (get, set, portfolio: Partial<PortfolioState>) => {
    const current = get(portfolioStateAtom);
    set(portfolioStateAtom, {
      ...current,
      ...portfolio,
      lastUpdate: new Date(),
    });
  }
);

// Persistence Atoms (for localStorage)
export const persistedSettingsAtom = atom(
  (get) => get(userSettingsAtom),
  (get, set, settings: UserSettings) => {
    set(userSettingsAtom, settings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('yieldswap-settings', JSON.stringify(settings));
    }
  }
);

export const loadPersistedSettingsAtom = atom(
  null,
  (get, set) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('yieldswap-settings');
      if (stored) {
        try {
          const settings = JSON.parse(stored);
          set(userSettingsAtom, settings);
        } catch (error) {
          console.error('Failed to load persisted settings:', error);
        }
      }
    }
  }
); 