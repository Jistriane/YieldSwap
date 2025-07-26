/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import React, { useState, useEffect, useMemo } from 'react';
import { useAtom } from 'jotai';
import { useTranslation } from 'next-i18next';
import { useApySocket } from '../hooks/useApySocket';
import { apyDataAtom } from '../lib/atoms';

// Componente Loading inline
const Loading = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 ${sizeClasses[size]}`} />
  );
};

export interface ApyTickerProps {
  asset: string;
  showTrend?: boolean;
  showVolume?: boolean;
  showRisk?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  format?: 'compact' | 'detailed';
  refreshInterval?: number;
  className?: string;
}

export const ApyTicker: React.FC<ApyTickerProps> = ({
  asset,
  showTrend = true,
  showVolume = false,
  showRisk = false,
  animated = true,
  size = 'md',
  format = 'compact',
  refreshInterval = 30000,
  className = '' 
}) => {
  const { t } = useTranslation('common');
  const [apyData] = useAtom(apyDataAtom);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  
  const { 
    apyData: socketApyData, 
    isLoading, 
    error, 
    isConnected, 
    reconnect,
    subscribe,
    connectionStatus,
    lastUpdate,
    dataQuality
  } = useApySocket();

  // Find current asset data
  const currentAssetData = useMemo(() => {
    return socketApyData.find(data => data.asset === asset) || 
           apyData.find(data => data.asset === asset);
  }, [socketApyData, apyData, asset]);

  // Subscribe to asset updates
  useEffect(() => {
    subscribe([asset]);
  }, [asset, subscribe]);

  // Handle APY updates and animations
  useEffect(() => {
    if (currentAssetData && currentAssetData.apy !== previousValue) {
      if (previousValue !== null && animated) {
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 2000);
      }
      setPreviousValue(currentAssetData.apy);
    }
  }, [currentAssetData?.apy, previousValue, animated]);

  // Auto refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        subscribe([asset]);
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [asset, refreshInterval, subscribe]);

  // Size classes
  const sizeClasses = {
    sm: {
      container: 'text-sm p-2',
      apy: 'text-lg font-bold',
      trend: 'text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      container: 'text-base p-3',
      apy: 'text-xl font-bold',
      trend: 'text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      container: 'text-lg p-4',
      apy: 'text-2xl font-bold',
      trend: 'text-base',
      icon: 'w-5 h-5'
    }
  };

  // Trend colors and icons
  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  // Risk color
  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Connection status indicator
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Data quality indicator
  const getDataQualityColor = () => {
    switch (dataQuality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Format number
  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(decimals);
  };

  // Loading state
  if (isLoading && !currentAssetData) {
    return (
      <div className={`flex items-center justify-center ${sizeClasses[size].container} ${className}`}>
        <Loading size={size} />
        <span className="ml-2 text-gray-500">{t('loading')}</span>
      </div>
    );
  }

  // Error state
  if (error && !currentAssetData) {
    return (
      <div className={`flex items-center justify-between ${sizeClasses[size].container} bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center">
          <span className="text-red-600">⚠</span>
          <span className="ml-2 text-red-700">{t('error.loadingApy')}</span>
        </div>
        <button
          onClick={reconnect}
          className="text-red-600 hover:text-red-800 text-sm underline"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  // No data state
  if (!currentAssetData) {
    return (
      <div className={`flex items-center justify-center ${sizeClasses[size].container} bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <span className="text-gray-500">{t('noData')}</span>
      </div>
    );
  }

  const { apy, trend, volume24h, risk, change24h, tvl, lastUpdate: dataLastUpdate } = currentAssetData;

  // Compact format
  if (format === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${sizeClasses[size].container} ${className}`}>
        {/* Connection status */}
        <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor()}`} />
        
        {/* APY */}
        <div className={`${sizeClasses[size].apy} ${showAnimation ? 'animate-pulse text-green-600' : 'text-gray-900'}`}>
          {apy.toFixed(2)}%
        </div>
        
        {/* Trend */}
        {showTrend && (
          <div className={`flex items-center ${sizeClasses[size].trend} ${getTrendColor(trend)}`}>
            <span className={sizeClasses[size].icon}>{getTrendIcon(trend)}</span>
            <span className="ml-1">{change24h > 0 ? '+' : ''}{change24h.toFixed(2)}%</span>
          </div>
        )}
        
        {/* Risk badge */}
        {showRisk && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk)}`}>
            {t(`risk.${risk}`)}
          </span>
        )}
      </div>
    );
  }

  // Detailed format
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${sizeClasses[size].container} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-900">{asset} APY</h3>
          <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor()}`} />
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span className={getDataQualityColor()}>
            {t(`dataQuality.${dataQuality}`)}
          </span>
          {lastUpdate && (
            <span>
              {t('lastUpdate')}: {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Main APY */}
      <div className={`${sizeClasses[size].apy} mb-2 ${showAnimation ? 'animate-pulse text-green-600' : 'text-gray-900'}`}>
        {apy.toFixed(2)}%
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {/* Trend */}
        {showTrend && (
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">{t('trend')}:</span>
            <div className={`flex items-center ${getTrendColor(trend)}`}>
              <span>{getTrendIcon(trend)}</span>
              <span className="ml-1">{change24h > 0 ? '+' : ''}{change24h.toFixed(2)}%</span>
            </div>
          </div>
        )}

        {/* Volume */}
        {showVolume && (
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">{t('volume24h')}:</span>
            <span className="font-medium">${formatNumber(volume24h)}</span>
          </div>
        )}

        {/* TVL */}
        <div className="flex items-center space-x-1">
          <span className="text-gray-500">{t('tvl')}:</span>
          <span className="font-medium">${formatNumber(tvl)}</span>
        </div>

        {/* Risk */}
        {showRisk && (
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">{t('risk')}:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk)}`}>
              {t(`risk.${risk}`)}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {dataLastUpdate && (
            <>
              {t('dataFrom')}: {new Date(dataLastUpdate).toLocaleString()}
            </>
          )}
        </div>
        
        {error && (
          <button
            onClick={reconnect}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {t('refresh')}
          </button>
        )}
      </div>
    </div>
  );
}; 