/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import { useTranslation } from 'next-i18next';
import { useWallet } from '../hooks/useWallet';

export function WalletButton() {
  const { t } = useTranslation('common');
  const { connected, address, connect, disconnect, isConnecting } = useWallet();

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
      disabled={isConnecting}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors min-w-[160px] disabled:opacity-50"
    >
      {isConnecting ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          Conectando...
        </div>
      ) : connected && address ? (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full" />
          <span>
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
      ) : (
        t('wallet.connect') || 'Conectar Carteira'
      )}
    </button>
  );
} 