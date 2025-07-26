/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAtom } from 'jotai';
import { useTranslation } from 'next-i18next';
import { useWallet } from '../hooks/useWallet';
import { useRoute } from '../hooks/useRoute';
import { useSwapAndEarn } from '../hooks/useSwapAndEarn';
import { routeDataAtom, apyDataAtom, swapStateAtom, userSettingsAtom } from '../lib/atoms';

// Componentes UI inline
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  onClick,
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  [key: string]: any;
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-blue-600 hover:bg-blue-50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        rounded-lg font-medium transition-colors duration-200
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <div className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

const Input = ({ 
  label, 
  error,
  className = '',
  ...props 
}: {
  label?: string;
  error?: string;
  className?: string;
  [key: string]: any;
}) => (
  <div className={`space-y-1 ${className}`}>
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <input
      className={`
        w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${error ? 'border-red-500' : 'border-gray-300'}
      `}
      {...props}
    />
    {error && (
      <p className="text-sm text-red-600">{error}</p>
    )}
  </div>
);

const Select = ({ 
  label, 
  options, 
  error,
  className = '',
  ...props 
}: {
  label?: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  className?: string;
  [key: string]: any;
}) => (
  <div className={`space-y-1 ${className}`}>
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <select
      className={`
        w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${error ? 'border-red-500' : 'border-gray-300'}
      `}
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-sm text-red-600">{error}</p>
    )}
  </div>
);

// Tipos
interface SwapFormData {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  slippage: number;
  deadline: number;
}

export interface SwapCardProps {
  onSwapComplete?: (hash: string) => void;
  className?: string;
}

const SUPPORTED_TOKENS = [
  { value: 'XLM', label: 'Stellar Lumens (XLM)', icon: '⭐' },
  { value: 'USDC', label: 'USD Coin (USDC)', icon: '💵' },
  { value: 'USDT', label: 'Tether (USDT)', icon: '💰' },
  { value: 'BTC', label: 'Bitcoin (BTC)', icon: '₿' },
  { value: 'ETH', label: 'Ethereum (ETH)', icon: '🔷' },
  { value: 'AQUA', label: 'Aquarius (AQUA)', icon: '🌊' },
  { value: 'YBX', label: 'YieldBlox (YBX)', icon: '📦' }
];

export const SwapCard: React.FC<SwapCardProps> = ({ 
  onSwapComplete,
  className = '' 
}) => {
  const { t } = useTranslation('common');
  const { address, connected, signTransaction } = useWallet();
  const [route, setRoute] = useAtom(routeDataAtom);
  const [apyData] = useAtom(apyDataAtom);
  const [swapState] = useAtom(swapStateAtom);
  const [userSettings] = useAtom(userSettingsAtom);
  
  const [formData, setFormData] = useState<SwapFormData>({
    sellToken: 'USDC',
    buyToken: 'XLM',
    sellAmount: '',
    buyAmount: '',
    slippage: userSettings.slippageTolerance,
    deadline: 20
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceImpactWarning, setPriceImpactWarning] = useState(false);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const { findRoute, isLoading: routeLoading, error: routeError } = useRoute();
  const { swap, isSwapping, swapError } = useSwapAndEarn();

  // Get current APY for selected tokens
  const sellTokenApy = useMemo(() => {
    return apyData.find(data => data.asset === formData.sellToken);
  }, [apyData, formData.sellToken]);

  const buyTokenApy = useMemo(() => {
    return apyData.find(data => data.asset === formData.buyToken);
  }, [apyData, formData.buyToken]);

  // Validate form
  const isFormValid = useMemo(() => {
    return formData.sellToken && 
           formData.buyToken && 
           formData.sellAmount && 
           parseFloat(formData.sellAmount) > 0 &&
           formData.sellToken !== formData.buyToken;
  }, [formData]);

  // Handle token swap
  const handleTokenSwap = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      sellToken: prev.buyToken,
      buyToken: prev.sellToken,
      sellAmount: prev.buyAmount,
      buyAmount: prev.sellAmount
    }));
    setRoute(null);
  }, [setRoute]);

  // Handle amount change
  const handleAmountChange = useCallback(async (field: 'sellAmount' | 'buyAmount', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (value && parseFloat(value) > 0 && formData.sellToken !== formData.buyToken) {
      setIsQuoting(true);
      setQuoteError(null);
      
      try {
        const routeData = await findRoute(
          formData.sellToken, 
          formData.buyToken, 
          value
        );
        
        if (routeData) {
          setFormData(prev => ({
            ...prev,
            buyAmount: field === 'sellAmount' ? routeData.outputAmount : prev.buyAmount
          }));
          
          // Check price impact
          setPriceImpactWarning(routeData.priceImpact > 5);
        }
      } catch (error: any) {
        setQuoteError(error.message);
      } finally {
        setIsQuoting(false);
      }
    }
  }, [formData.sellToken, formData.buyToken, findRoute]);

  // Handle swap execution
  const handleSwap = useCallback(async () => {
    if (!connected || !isFormValid) return;

    try {
      const hash = await swap({
        fromAsset: formData.sellToken,
        toAsset: formData.buyToken,
        amount: formData.sellAmount,
        slippage: formData.slippage,
        deadline: formData.deadline
      });

      if (hash) {
        onSwapComplete?.(hash);
        
        // Reset form
        setFormData(prev => ({
          ...prev,
          sellAmount: '',
          buyAmount: ''
        }));
        setRoute(null);
      }
    } catch (error: any) {
      console.error('Swap failed:', error);
    }
  }, [connected, isFormValid, swap, formData, onSwapComplete, setRoute]);

  // Format number
  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(decimals);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{t('swap.title')}</h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAdvanced ? t('hideAdvanced') : t('showAdvanced')}
        </button>
      </div>

      {/* Sell Token Section */}
      <div className="space-y-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">{t('from')}</label>
            {sellTokenApy && (
              <div className="text-xs text-green-600">
                APY: {sellTokenApy.apy.toFixed(2)}%
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Select
              options={SUPPORTED_TOKENS}
              value={formData.sellToken}
                             onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, sellToken: e.target.value }))}
              className="w-1/3"
              title={t('selectSellToken')}
            />
            
            <Input
              type="number"
              placeholder="0.00"
              value={formData.sellAmount}
                             onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAmountChange('sellAmount', e.target.value)}
              className="flex-1"
              title={t('enterSellAmount')}
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleTokenSwap}
            className="p-2 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
            title={t('swapTokens')}
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* Buy Token Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">{t('to')}</label>
            {buyTokenApy && (
              <div className="text-xs text-green-600">
                APY: {buyTokenApy.apy.toFixed(2)}%
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Select
              options={SUPPORTED_TOKENS}
              value={formData.buyToken}
                             onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, buyToken: e.target.value }))}
               className="w-1/3"
               title={t('selectBuyToken')}
             />
             
             <Input
               type="number"
               placeholder="0.00"
               value={formData.buyAmount}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAmountChange('buyAmount', e.target.value)}
              className="flex-1"
              disabled={isQuoting}
              title={t('estimatedReceiveAmount')}
            />
          </div>
        </div>
      </div>

      {/* Route Information */}
      {route && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">{t('routeDetails')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('priceImpact')}:</span>
              <span className={route.priceImpact > 5 ? 'text-red-600 font-medium' : 'text-gray-900'}>
                {route.priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('estimatedGas')}:</span>
              <span className="text-gray-900">{formatNumber(route.estimatedGas)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('executionTime')}:</span>
              <span className="text-gray-900">{route.executionTime}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Price Impact Warning */}
      {priceImpactWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <span className="text-yellow-600">⚠️</span>
            <span className="ml-2 text-sm text-yellow-700">
              {t('highPriceImpactWarning')}
            </span>
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-700">{t('advancedSettings')}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('slippageTolerance')}
              type="number"
              step="0.1"
              min="0.1"
              max="50"
              value={formData.slippage}
                             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, slippage: parseFloat(e.target.value) }))}
             />
             
             <Input
               label={t('transactionDeadline')}
               type="number"
               min="1"
               max="180"
               value={formData.deadline}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, deadline: parseInt(e.target.value) }))}
            />
          </div>
        </div>
      )}

      {/* Error Messages */}
      {(routeError || swapError || quoteError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-700">
            {routeError || swapError || quoteError}
          </p>
        </div>
      )}

      {/* Swap Button */}
      <Button
        onClick={handleSwap}
        disabled={!connected || !isFormValid || isSwapping || routeLoading}
        loading={isSwapping || routeLoading}
        className="w-full"
        size="lg"
      >
        {!connected 
          ? t('connectWallet')
          : isSwapping 
            ? t('swapping')
            : routeLoading 
              ? t('findingRoute')
              : t('swap')
        }
      </Button>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{t('poweredBy')} YieldSwap</span>
          {route && (
            <span>
              {t('confidence')}: {route.confidence.toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}; 