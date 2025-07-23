import { useWallet } from '@stellar/wallet-kit';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export function WalletButton() {
  const { t } = useTranslation();
  const { address, connected, connect, disconnect } = useWallet();

  const handleClick = () => {
    if (connected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={connected ? 'outline' : 'default'}
      className="min-w-[160px]"
    >
      {connected ? (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full" />
          <span>
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
      ) : (
        t('wallet.connect')
      )}
    </Button>
  );
} 