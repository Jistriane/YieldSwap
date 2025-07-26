/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import { useState, useEffect, useRef, useCallback } from 'react';
import { useAtom } from 'jotai';
import { apyDataAtom } from '../lib/atoms';

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

export interface UseApySocketReturn {
  apyData: ApyData[];
  isConnected: boolean;
  error: string | null;
  isLoading: boolean;
  reconnect: () => void;
  subscribe: (assets: string[]) => void;
  unsubscribe: (assets: string[]) => void;
  getHistoricalData: (asset: string, period: '1h' | '24h' | '7d' | '30d') => Promise<ApyData[]>;
  refreshData: () => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastUpdate: Date | null;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
const POLLING_INTERVAL = 30000; // 30 seconds
const RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000;

export const useApySocket = (): UseApySocketReturn => {
  const [apyData, setApyData] = useAtom(apyDataAtom);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dataQuality, setDataQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const subscribedAssetsRef = useRef<string[]>([]);

  const calculateDataQuality = useCallback((data: ApyData[]): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (!data.length) return 'poor';
    
    const now = new Date();
    const recentData = data.filter(d => 
      now.getTime() - d.lastUpdate.getTime() < 60000 // within 1 minute
    );
    
    const qualityRatio = recentData.length / data.length;
    
    if (qualityRatio >= 0.9) return 'excellent';
    if (qualityRatio >= 0.7) return 'good';
    if (qualityRatio >= 0.5) return 'fair';
    return 'poor';
  }, []);

  const fetchApyData = useCallback(async (assets?: string[]): Promise<ApyData[]> => {
    try {
      const assetsParam = assets ? `?assets=${assets.join(',')}` : '';
      const response = await fetch(`/api/apy${assetsParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform data to match ApyData interface
      const transformedData: ApyData[] = data.map((item: any) => ({
        asset: item.asset,
        apy: parseFloat(item.apy) || 0,
        tvl: parseFloat(item.tvl) || 0,
        volume24h: parseFloat(item.volume24h) || 0,
        change24h: parseFloat(item.change24h) || 0,
        lastUpdate: new Date(item.lastUpdate || Date.now()),
        trend: item.trend || 'stable',
        historical: item.historical || [],
        risk: item.risk || 'medium',
        liquidity: parseFloat(item.liquidity) || 0,
        fees: {
          swap: parseFloat(item.fees?.swap) || 0.003,
          withdrawal: parseFloat(item.fees?.withdrawal) || 0.001,
        },
        rewards: {
          daily: parseFloat(item.rewards?.daily) || 0,
          weekly: parseFloat(item.rewards?.weekly) || 0,
          monthly: parseFloat(item.rewards?.monthly) || 0,
          yearly: parseFloat(item.rewards?.yearly) || 0,
        },
        metrics: {
          sharpeRatio: parseFloat(item.metrics?.sharpeRatio) || 0,
          volatility: parseFloat(item.metrics?.volatility) || 0,
          maxDrawdown: parseFloat(item.metrics?.maxDrawdown) || 0,
        },
      }));
      
      return transformedData;
    } catch (err: any) {
      console.error('Error fetching APY data:', err);
      throw err;
    }
  }, []);

  const setupPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const data = await fetchApyData(subscribedAssetsRef.current);
        setApyData(data);
        setLastUpdate(new Date());
        setDataQuality(calculateDataQuality(data));
        setError(null);
      } catch (err: any) {
        setError(err instanceof Error ? err.message : 'Failed to fetch APY data');
      }
    }, POLLING_INTERVAL);
  }, [fetchApyData, setApyData, calculateDataQuality]);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    setConnectionStatus('connecting');
    setIsLoading(true);
    
    try {
      wsRef.current = new WebSocket(WEBSOCKET_URL);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        // Subscribe to existing assets
        if (subscribedAssetsRef.current.length > 0) {
          wsRef.current?.send(JSON.stringify({
            type: 'subscribe',
            assets: subscribedAssetsRef.current
          }));
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        // Fallback to polling when WebSocket disconnects
        setupPolling();
      };

      wsRef.current.onerror = (err: any) => {
        setError(`Connection error: ${err.message || 'WebSocket error'}`);
        setConnectionStatus('error');
        setIsConnected(false);
        
        // Fallback to polling on connection error
        setupPolling();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'apy_update' && message.data) {
            setApyData(message.data);
            setLastUpdate(new Date());
            setDataQuality(calculateDataQuality(message.data));
            setIsLoading(false);
            setError(null);
          }
        } catch (err: any) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      // Initial data fetch
      fetchApyData()
        .then((data) => {
          setApyData(data);
          setLastUpdate(new Date());
          setDataQuality(calculateDataQuality(data));
          setIsLoading(false);
        })
        .catch((err: any) => {
          setError(err.message);
          setIsLoading(false);
          // Start polling as fallback
          setupPolling();
        });
    } catch (err: any) {
      setError(`Failed to connect: ${err.message}`);
      setConnectionStatus('error');
      setIsLoading(false);
      setupPolling();
    }
  }, [fetchApyData, setApyData, calculateDataQuality, setupPolling]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connectWebSocket, 1000);
  }, [disconnect, connectWebSocket]);

  const subscribe = useCallback((assets: string[]) => {
    subscribedAssetsRef.current = Array.from(new Set([...subscribedAssetsRef.current, ...assets]));
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        assets: assets
      }));
    }
    
    // Fetch data for new assets
    fetchApyData(subscribedAssetsRef.current)
      .then((data) => {
        setApyData(data);
        setLastUpdate(new Date());
        setDataQuality(calculateDataQuality(data));
      })
      .catch((err: any) => {
        setError(err.message);
      });
  }, [fetchApyData, setApyData, calculateDataQuality]);

  const unsubscribe = useCallback((assets: string[]) => {
    subscribedAssetsRef.current = subscribedAssetsRef.current.filter(
      (asset) => !assets.includes(asset)
    );
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        assets: assets
      }));
    }
  }, []);

  const getHistoricalData = useCallback(async (
    asset: string, 
    period: '1h' | '24h' | '7d' | '30d'
  ): Promise<ApyData[]> => {
    try {
      const response = await fetch(`/api/apy/historical?asset=${asset}&period=${period}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err: any) {
      console.error('Error fetching historical data:', err);
      throw err;
    }
  }, []);

  const refreshData = useCallback(() => {
    setIsLoading(true);
    fetchApyData(subscribedAssetsRef.current)
      .then((data) => {
        setApyData(data);
        setLastUpdate(new Date());
        setDataQuality(calculateDataQuality(data));
        setIsLoading(false);
        setError(null);
      })
      .catch((err: any) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [fetchApyData, setApyData, calculateDataQuality]);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      disconnect();
    };
  }, [connectWebSocket, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    apyData,
    isConnected,
    error,
    isLoading,
    reconnect,
    subscribe,
    unsubscribe,
    getHistoricalData,
    refreshData,
    connectionStatus,
    lastUpdate,
    dataQuality,
  };
}; 