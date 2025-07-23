import { useState, useEffect } from 'react';
import { ws } from '@/lib/ws';

interface ApyData {
  vault: string;
  asset: string;
  apy: string;
  timestamp: number;
}

export function useApySocket(asset: string) {
  const [data, setData] = useState<ApyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleUpdate = (update: ApyData) => {
      setData(update);
      setIsLoading(false);
    };

    const handleError = (err: Error) => {
      setError(err);
      setIsLoading(false);
    };

    // Subscrever ao vault
    const unsubscribe = ws.subscribe(asset, handleUpdate);

    // Limpar subscrição ao desmontar
    return () => {
      unsubscribe();
    };
  }, [asset]);

  return { data, isLoading, error };
} 