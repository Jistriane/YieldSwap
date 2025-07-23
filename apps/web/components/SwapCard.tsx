import { useState } from 'react';
import { useAtom } from 'jotai';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useWallet } from '@stellar/wallet-kit';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useTranslation } from '@/lib/i18n';
import { routeAtom, apyAtom } from '@/lib/atoms';
import { api } from '@/lib/api';

interface SwapFormData {
  sellToken: string;
  buyToken: string;
  amount: string;
}

export function SwapCard() {
  const { t } = useTranslation();
  const { address, connected, signTransaction } = useWallet();
  const { toast } = useToast();
  const [route, setRoute] = useAtom(routeAtom);
  const [apy] = useAtom(apyAtom);
  const [formData, setFormData] = useState<SwapFormData>({
    sellToken: '',
    buyToken: '',
    amount: '',
  });

  // Buscar rota de swap
  const { data: routeData, isLoading: isLoadingRoute } = useQuery({
    queryKey: ['route', formData],
    queryFn: async () => {
      if (!formData.sellToken || !formData.buyToken || !formData.amount) {
        return null;
      }
      const response = await api.post('/v1/swap/route', {
        sellToken: formData.sellToken,
        buyToken: formData.buyToken,
        amountIn: formData.amount,
        slippageBps: 100, // 1%
      });
      return response.data;
    },
    enabled: !!formData.sellToken && !!formData.buyToken && !!formData.amount,
  });

  // Executar swap
  const { mutate: executeSwap, isLoading: isSwapping } = useMutation({
    mutationFn: async () => {
      // 1. Obter XDR
      const { data: txData } = await api.post('/v1/swap/build', {
        route: routeData.route,
        userAddress: address,
      });

      // 2. Assinar transação
      const signedXdr = await signTransaction(txData.xdr, {
        networkPassphrase: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE,
      });

      // 3. Enviar transação
      const { data: result } = await api.post('/v1/swap/submit', {
        signedXdr,
      });

      return result;
    },
    onSuccess: (data) => {
      toast({
        title: t('toast.txConfirmed'),
        description: t('toast.txConfirmed', { shares: data.shares }),
      });
      setRoute(null);
    },
    onError: (error: Error) => {
      toast({
        title: t('error.unknownError'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      toast({
        title: t('wallet.connect'),
        description: t('wallet.connect'),
      });
      return;
    }
    executeSwap();
  };

  const getButtonText = () => {
    if (!connected) return t('wallet.connect');
    if (isSwapping) return t('swap.button.loading');
    if (apy) return t('swap.button.swap', { apy: apy.value });
    return t('swap.button.swap', { apy: '0.00' });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('swap.from')}
          </label>
          <Input
            name="sellToken"
            value={formData.sellToken}
            onChange={handleInputChange}
            placeholder="USDC"
            required
            disabled={isSwapping}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t('swap.amount')}
          </label>
          <Input
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.00"
            min="0"
            step="0.000001"
            required
            disabled={isSwapping}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t('swap.to')}
          </label>
          <Input
            name="buyToken"
            value={formData.buyToken}
            onChange={handleInputChange}
            placeholder="XLM"
            required
            disabled={isSwapping}
          />
        </div>

        {routeData && (
          <div className="bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span>{t('swap.rate')}</span>
              <span>
                1 {formData.sellToken} = {routeData.route.amountOut}{' '}
                {formData.buyToken}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('swap.networkFee')}</span>
              <span>{routeData.gasEstimate} XLM</span>
            </div>
            <div className="flex justify-between">
              <span>{t('swap.minReceived')}</span>
              <span>{routeData.minOut} {formData.buyToken}</span>
            </div>
            {apy && (
              <div className="flex justify-between">
                <span>{t('swap.apy')}</span>
                <span className="text-green-400">{apy.value}%</span>
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isSwapping || isLoadingRoute}
          aria-label={t('aria.swapButton')}
        >
          {getButtonText()}
        </Button>
      </form>
    </Card>
  );
} 