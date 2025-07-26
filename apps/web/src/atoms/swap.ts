/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import { atom } from 'jotai';

interface SwapRoute {
  tokenIn?: string;
  tokenOut?: string;
  amountIn?: string;
  amountOut?: string;
  priceImpact?: string;
  path?: string[];
}

export const swapRouteAtom = atom<SwapRoute>({}); 