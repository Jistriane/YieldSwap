import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useTranslation } from '@/lib/i18n';
import { useApySocket } from '@/hooks/useApySocket';
import { apyAtom } from '@/lib/atoms';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Lottie from 'react-lottie-player';
import upArrowAnimation from '@/animations/up-arrow.json';

export function ApyTicker() {
  const { t } = useTranslation();
  const [apy, setApy] = useAtom(apyAtom);
  const { data, isLoading, error } = useApySocket('XLM');

  useEffect(() => {
    if (data) {
      const oldValue = apy?.value ?? 0;
      const newValue = parseFloat(data.apy);
      const hasIncrease = newValue > oldValue + 0.2;

      setApy({
        value: newValue,
        vault: data.vault,
        hasIncrease,
        timestamp: data.timestamp,
      });
    }
  }, [data, apy?.value, setApy]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2" aria-label={t('aria.loadingApy')}>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-6" />
      </div>
    );
  }

  if (error || !apy) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="success" className="text-sm">
        APY: {apy.value.toFixed(2)}%
      </Badge>
      {apy.hasIncrease && (
        <Lottie
          loop={false}
          play
          animationData={upArrowAnimation}
          style={{ width: 24, height: 24 }}
        />
      )}
    </div>
  );
} 