import { useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useWallet } from '@stellar/wallet-kit';
import { routeAtom, pendingTxAtom } from '@/lib/atoms';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { useTranslation } from '@/lib/i18n';

export function useSwapAndEarn() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { address, signTransaction } = useWallet();
  const [route] = useAtom(routeAtom);
  const [, setPendingTx] = useAtom(pendingTxAtom);

  return useMutation({
    mutationFn: async () => {
      if (!route || !address) {
        throw new Error('Rota ou carteira não disponível');
      }

      // 1. Obter XDR
      const { data: txData } = await api.post('/v1/swap/build', {
        route,
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

      // 4. Atualizar estado
      setPendingTx({
        xdr: signedXdr,
        hash: result.hash,
        timestamp: Date.now(),
      });

      return result;
    },
    onSuccess: (data) => {
      toast({
        title: t('toast.txConfirmed'),
        description: t('toast.txConfirmed', { shares: data.shares }),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('error.unknownError'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });
} 