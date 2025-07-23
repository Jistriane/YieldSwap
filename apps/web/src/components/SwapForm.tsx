import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useAtom } from 'jotai';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useWallet } from '@stellar/wallet-sdk';
import { Loading, SkeletonCard } from '@yieldswap/ui';
import { swapRouteAtom } from '../atoms/swap';
import { api } from '../lib/api';

export function SwapForm() {
  const { t } = useTranslation('common');
  const { address } = useWallet();
  const [swapRoute, setSwapRoute] = useAtom(swapRouteAtom);
  const [formData, setFormData] = useState({
    tokenIn: '',
    tokenOut: '',
    amountIn: '',
  });

  const { data: simulationData, isLoading: isSimulating, mutate: simulateSwap } = useMutation({
    mutationFn: async () => {
      const response = await api.get('/v1/swap/simulate', {
        params: {
          ...formData,
          userAddress: address,
        },
      });
      return response.data;
    },
  });

  const { data: apyData, isLoading: isLoadingApy } = useQuery({
    queryKey: ['apy', formData.tokenOut],
    queryFn: async () => {
      if (!formData.tokenOut) return null;
      const response = await api.get(`/v1/apy/${formData.tokenOut}`);
      return response.data;
    },
    enabled: !!formData.tokenOut,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'tokenIn' || name === 'tokenOut') {
      setSwapRoute((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await simulateSwap();
  };

  if (isLoadingApy) {
    return <SkeletonCard className="w-full max-w-md mx-auto" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('swap.from')}
        </label>
        <input
          type="text"
          name="tokenIn"
          value={formData.tokenIn}
          onChange={handleInputChange}
          className="w-full bg-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="USDC"
          required
          disabled={isSimulating}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('swap.amount')}
        </label>
        <input
          type="number"
          name="amountIn"
          value={formData.amountIn}
          onChange={handleInputChange}
          className="w-full bg-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
          min="0"
          step="0.000001"
          required
          disabled={isSimulating}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('swap.to')}
        </label>
        <input
          type="text"
          name="tokenOut"
          value={formData.tokenOut}
          onChange={handleInputChange}
          className="w-full bg-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="XLM"
          required
          disabled={isSimulating}
        />
      </div>

      {simulationData && (
        <div className="bg-gray-700 rounded-md p-4 space-y-2">
          <div className="flex justify-between">
            <span>{t('swap.rate')}</span>
            <span>
              1 {formData.tokenIn} = {simulationData.route.amountOut}{' '}
              {formData.tokenOut}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t('swap.apy')}</span>
            <span className="text-green-400">
              {apyData?.apy}%
            </span>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSimulating}
      >
        {isSimulating ? (
          <Loading type="spinner" className="mx-auto" />
        ) : (
          t('swap.confirm')
        )}
      </button>
    </form>
  );
} 