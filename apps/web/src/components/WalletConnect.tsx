import { useTranslation } from 'next-i18next';
import { useWallet } from '../../hooks/useWallet';

export function WalletConnect() {
  const { t } = useTranslation('common');
  const { connected, address, connect, disconnect } = useWallet();

  const handleClick = () => {
    if (connected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
    >
      {connected ? (
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full" />
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      ) : (
        t('wallet.connect')
      )}
    </button>
  );
} 