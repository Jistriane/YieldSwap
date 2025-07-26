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
import { useTranslation } from 'next-i18next';

export function SwapForm() {
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState({
    tokenIn: '',
    tokenOut: '',
    amountIn: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular delay de processamento
    setTimeout(() => {
      setSimulationData({
        route: {
          amountOut: (parseFloat(formData.amountIn) * 0.95).toFixed(6),
        },
        apy: '12.45',
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2 text-white">
          {t('swap.from') || 'De'}
        </label>
        <input
          type="text"
          name="tokenIn"
          value={formData.tokenIn}
          onChange={handleInputChange}
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="USDC"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-white">
          {t('swap.amount') || 'Quantidade'}
        </label>
        <input
          type="number"
          name="amountIn"
          value={formData.amountIn}
          onChange={handleInputChange}
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="0.00"
          min="0"
          step="0.000001"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-white">
          {t('swap.to') || 'Para'}
        </label>
        <input
          type="text"
          name="tokenOut"
          value={formData.tokenOut}
          onChange={handleInputChange}
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="XLM"
          required
          disabled={isLoading}
        />
      </div>

      {simulationData && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-white">
            <span>{t('swap.rate') || 'Taxa'}</span>
            <span>
              1 {formData.tokenIn} = {simulationData.route.amountOut}{' '}
              {formData.tokenOut}
            </span>
          </div>
          <div className="flex justify-between text-white">
            <span>{t('swap.apy') || 'APY'}</span>
            <span className="text-green-400">
              {simulationData.apy}%
            </span>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Simulando...' : (t('swap.confirm') || 'Confirmar Swap')}
      </button>
    </form>
  );
} 