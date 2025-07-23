import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { routeAtom } from '@/lib/atoms';
import { api } from '@/lib/api';

interface RouteParams {
  sellToken: string;
  buyToken: string;
  amount: string;
  slippageBps?: number;
}

export function useRoute(params: RouteParams) {
  const [, setRoute] = useAtom(routeAtom);

  return useQuery({
    queryKey: ['route', params],
    queryFn: async () => {
      const { data } = await api.post('/v1/swap/route', {
        ...params,
        slippageBps: params.slippageBps || 100,
      });
      setRoute(data);
      return data;
    },
    enabled: !!(params.sellToken && params.buyToken && params.amount),
    staleTime: 30000, // 30 segundos
    cacheTime: 60000, // 1 minuto
  });
} 