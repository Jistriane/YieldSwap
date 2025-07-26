/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import { useState } from 'react';

export function WalletConnect() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');

  const handleConnect = () => {
    if (connected) {
      setConnected(false);
      setAddress('');
    } else {
      setConnected(true);
      setAddress('GCKFBEIYTKP6RCZX6LRQW7OQHDBADI4HQBR5HFKJQX7WVHEKFZQ2LTBM');
    }
  };

  return (
    <button
      onClick={handleConnect}
      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
        connected 
          ? 'bg-white/10 border border-white/20 text-white' 
          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
      }`}
    >
      {connected ? (
        <span>
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      ) : (
        'Conectar Carteira'
      )}
    </button>
  );
} 