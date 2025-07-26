/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import { Api } from './api';
import { WebSocket } from './websocket';
import { Wallet } from './wallet';
import { formatAmount, calculatePriceImpact, calculateSlippage } from './utils';
import { YieldSwapError } from './errors';

describe('YieldSwap SDK', () => {
  describe('Api', () => {
    const api = new Api({
      baseURL: 'http://localhost:3001',
    });

    it('should get swap route', async () => {
      const route = await api.getSwapRoute('USDC', 'XLM', '100');
      expect(route).toBeDefined();
      expect(route.path).toBeInstanceOf(Array);
      expect(route.amountOut).toBeDefined();
      expect(route.priceImpact).toBeDefined();
    });

    it('should get vault APY', async () => {
      const vault = await api.getVaultApy('XLM');
      expect(vault).toBeDefined();
      expect(vault.address).toBeDefined();
      expect(vault.apy).toBeDefined();
    });
  });

  describe('Utils', () => {
    it('should format amount', () => {
      expect(formatAmount('1.23456789', 7)).toBe('1.2345679');
      expect(formatAmount(1.23456789, 7)).toBe('1.2345679');
    });

    it('should calculate price impact', () => {
      expect(calculatePriceImpact('100', '99', '1')).toBe('1.00');
      expect(calculatePriceImpact('100', '95', '1')).toBe('5.00');
    });

    it('should calculate slippage', () => {
      expect(calculateSlippage('100', 0.5)).toBe('99.5000000');
      expect(calculateSlippage('100', 1)).toBe('99.0000000');
    });
  });

  describe('Errors', () => {
    it('should create YieldSwap error', () => {
      const error = new YieldSwapError('WALLET_NOT_CONNECTED', 'Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe('WALLET_NOT_CONNECTED');
      expect(error.message).toBe('Test error');
    });
  });
}); 