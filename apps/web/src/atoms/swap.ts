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