import BigNumber from 'bignumber.js';

export function formatAmount(amount: string | number, decimals = 7): string {
  return new BigNumber(amount).toFixed(decimals);
}

export function calculatePriceImpact(
  amountIn: string,
  amountOut: string,
  price: string,
): string {
  const expectedAmountOut = new BigNumber(amountIn).multipliedBy(price);
  const actualAmountOut = new BigNumber(amountOut);
  const priceImpact = expectedAmountOut
    .minus(actualAmountOut)
    .dividedBy(expectedAmountOut)
    .multipliedBy(100);
  return priceImpact.toFixed(2);
}

export function calculateSlippage(amount: string, slippage: number): string {
  return new BigNumber(amount)
    .multipliedBy(1 - slippage / 100)
    .toFixed(7);
}

export function formatAddress(address: string, length = 6): string {
  if (!address) return '';
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> {
  return fn().catch((error) => {
    if (maxRetries === 0) {
      throw error;
    }
    return sleep(delay).then(() => retry(fn, maxRetries - 1, delay));
  });
}

export function validateAddress(address: string): boolean {
  // Stellar address validation
  return /^G[A-Z0-9]{55}$/.test(address);
}

export function validateAmount(amount: string): boolean {
  return new BigNumber(amount).isGreaterThan(0);
}

export function validateSlippage(slippage: number): boolean {
  return slippage > 0 && slippage <= 100;
} 