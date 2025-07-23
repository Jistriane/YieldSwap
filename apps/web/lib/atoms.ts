import { atom } from 'jotai';

interface Route {
  path: string[];
  amountOut: string;
  priceImpact: string;
  minOut: string;
  gasEstimate: string;
}

interface Apy {
  value: number;
  vault: string;
  hasIncrease: boolean;
  timestamp: number;
}

interface PendingTx {
  xdr: string;
  hash: string;
  timestamp: number;
}

// Rota de swap atual
export const routeAtom = atom<Route | null>(null);

// APY atual do vault
export const apyAtom = atom<Apy | null>(null);

// Transação pendente
export const pendingTxAtom = atom<PendingTx | null>(null);

// Idioma atual
export const localeAtom = atom<'pt' | 'en' | 'es'>('pt'); 