import { useState, useCallback, useRef } from 'react';
import { useAtom } from 'jotai';
import { routeDataAtom, swapStateAtom } from '../lib/atoms';

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

export interface UseRouteOptions {
  maxHops?: number;
  maxSlippage?: number;
  gasOptimization?: boolean;
  includeAlternatives?: boolean;
  refreshInterval?: number;
}

export interface UseRouteReturn {
  route: RouteData | null;
  isLoading: boolean;
  error: string | null;
  findRoute: (fromAsset: string, toAsset: string, amount: string, options?: UseRouteOptions) => Promise<RouteData | null>;
  refreshRoute: () => Promise<void>;
  clearRoute: () => void;
  alternatives: RouteData['alternatives'];
  bestRoute: RouteData | null;
  routeScore: number;
  priceImpactWarning: boolean;
  gasEstimate: number;
  executionTime: number;
  isRouteStale: boolean;
  routeAge: number;
}

const DEFAULT_OPTIONS: UseRouteOptions = {
  maxHops: 3,
  maxSlippage: 5.0,
  gasOptimization: true,
  includeAlternatives: true,
  refreshInterval: 30000,
};

const ROUTE_STALE_TIME = 60000; // 1 minute
const MAX_PRICE_IMPACT = 15.0; // 15%

export const useRoute = (): UseRouteReturn => {
  const [route, setRoute] = useAtom(routeDataAtom);
  const [swapState] = useAtom(swapStateAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const lastRequestRef = useRef<{
    fromAsset: string;
    toAsset: string;
    amount: string;
    timestamp: Date;
  } | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const calculateRouteScore = useCallback((routeData: RouteData): number => {
    const outputScore = parseFloat(routeData.outputAmount) * 0.4;
    const priceImpactScore = Math.max(0, 100 - routeData.priceImpact * 10) * 0.3;
    const gasScore = Math.max(0, 100 - routeData.estimatedGas / 1000) * 0.2;
    const confidenceScore = routeData.confidence * 0.1;
    
    return outputScore + priceImpactScore + gasScore + confidenceScore;
  }, []);

  const analyzeRisks = useCallback((routeData: Partial<RouteData>): RouteData['risks'] => {
    const risks: RouteData['risks'] = [];

    // Liquidity risk
    if (routeData.path && routeData.path.some(step => step.liquidity < 10000)) {
      risks.push({
        type: 'liquidity',
        level: 'high',
        description: 'Low liquidity in one or more pools may cause significant slippage'
      });
    } else if (routeData.path && routeData.path.some(step => step.liquidity < 50000)) {
      risks.push({
        type: 'liquidity',
        level: 'medium',
        description: 'Medium liquidity - monitor for potential slippage'
      });
    }

    // Price impact risk
    if (routeData.priceImpact && routeData.priceImpact > 10) {
      risks.push({
        type: 'price',
        level: 'high',
        description: `High price impact (${routeData.priceImpact.toFixed(2)}%) - consider smaller amounts`
      });
    } else if (routeData.priceImpact && routeData.priceImpact > 5) {
      risks.push({
        type: 'price',
        level: 'medium',
        description: `Moderate price impact (${routeData.priceImpact.toFixed(2)}%)`
      });
    }

    // Slippage risk
    if (routeData.slippage && routeData.slippage > 3) {
      risks.push({
        type: 'slippage',
        level: 'high',
        description: `High slippage tolerance (${routeData.slippage}%) increases execution risk`
      });
    }

    // Gas risk
    if (routeData.estimatedGas && routeData.estimatedGas > 500000) {
      risks.push({
        type: 'gas',
        level: 'high',
        description: 'High gas cost due to complex routing path'
      });
    } else if (routeData.estimatedGas && routeData.estimatedGas > 200000) {
      risks.push({
        type: 'gas',
        level: 'medium',
        description: 'Moderate gas cost for multi-hop swap'
      });
    }

    return risks;
  }, []);

  const findRoute = useCallback(async (
    fromAsset: string,
    toAsset: string,
    amount: string,
    options: UseRouteOptions = {}
  ): Promise<RouteData | null> => {
    if (!fromAsset || !toAsset || !amount || parseFloat(amount) <= 0) {
      setError('Invalid route parameters');
      return null;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsLoading(true);
    setError(null);

    const requestOptions = { ...DEFAULT_OPTIONS, ...options };
    
    try {
      // Store request details
      lastRequestRef.current = {
        fromAsset,
        toAsset,
        amount,
        timestamp: new Date(),
      };

      const response = await fetch('/api/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromAsset,
          toAsset,
          amount,
          options: requestOptions,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Route finding failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Transform and validate response
      const routeData: RouteData = {
        path: data.path || [],
        inputAmount: amount,
        outputAmount: data.outputAmount || '0',
        priceImpact: parseFloat(data.priceImpact) || 0,
        slippage: requestOptions.maxSlippage || 0.5,
        estimatedGas: parseInt(data.estimatedGas) || 0,
        executionTime: parseInt(data.executionTime) || 0,
        confidence: parseFloat(data.confidence) || 0,
        risks: [],
        alternatives: data.alternatives || [],
        metadata: {
          timestamp: new Date(),
          blockNumber: data.blockNumber || 0,
          validUntil: new Date(Date.now() + ROUTE_STALE_TIME),
          source: data.source || 'api',
        },
      };

      // Analyze risks
      routeData.risks = analyzeRisks(routeData);

      // Process alternatives
      if (requestOptions.includeAlternatives && data.alternatives) {
        routeData.alternatives = data.alternatives.map((alt: any) => ({
          path: alt.path || [],
          outputAmount: alt.outputAmount || '0',
          priceImpact: parseFloat(alt.priceImpact) || 0,
          score: calculateRouteScore({
            ...routeData,
            path: alt.path,
            outputAmount: alt.outputAmount,
            priceImpact: parseFloat(alt.priceImpact) || 0,
          }),
          estimatedGas: parseInt(alt.estimatedGas) || 0,
          confidence: parseFloat(alt.confidence) || 0,
        }));

        // Sort alternatives by score
        routeData.alternatives.sort((a, b) => b.score - a.score);
      }

      setRoute(routeData);
      setIsLoading(false);
      
      return routeData;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return null; // Request was cancelled
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to find route';
      setError(errorMessage);
      setIsLoading(false);
      
      console.error('Route finding error:', err);
      return null;
    }
  }, [setRoute, calculateRouteScore, analyzeRisks]);

  const refreshRoute = useCallback(async (): Promise<void> => {
    if (!lastRequestRef.current) {
      setError('No previous route to refresh');
      return;
    }

    const { fromAsset, toAsset, amount } = lastRequestRef.current;
    await findRoute(fromAsset, toAsset, amount);
  }, [findRoute]);

  const clearRoute = useCallback(() => {
    setRoute(null);
    setError(null);
    lastRequestRef.current = null;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [setRoute]);

  // Derived values
  const alternatives = route?.alternatives || [];
  const bestRoute = route;
  const routeScore = route ? calculateRouteScore(route) : 0;
  const priceImpactWarning = route ? route.priceImpact > MAX_PRICE_IMPACT : false;
  const gasEstimate = route?.estimatedGas || 0;
  const executionTime = route?.executionTime || 0;
  
  const isRouteStale = route ? 
    new Date() > route.metadata.validUntil : 
    false;
    
  const routeAge = route ? 
    Date.now() - route.metadata.timestamp.getTime() : 
    0;

  return {
    route,
    isLoading,
    error,
    findRoute,
    refreshRoute,
    clearRoute,
    alternatives,
    bestRoute,
    routeScore,
    priceImpactWarning,
    gasEstimate,
    executionTime,
    isRouteStale,
    routeAge,
  };
}; 