import axios, { AxiosInstance } from 'axios';
import { ApiConfig, SwapRoute, VaultInfo, SimulationResult } from './types';
import { retry } from './utils';

export class Api {
  private client: AxiosInstance;

  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });
  }

  async getSwapRoute(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
  ): Promise<SwapRoute> {
    const response = await retry(() =>
      this.client.get('/v1/swap/route', {
        params: {
          tokenIn,
          tokenOut,
          amountIn,
        },
      }),
    );
    return response.data;
  }

  async getVaultApy(asset: string): Promise<VaultInfo> {
    const response = await retry(() =>
      this.client.get(`/v1/apy/${asset}`),
    );
    return response.data;
  }

  async getBestVault(asset: string): Promise<VaultInfo> {
    const response = await retry(() =>
      this.client.get(`/v1/apy/best/${asset}`),
    );
    return response.data;
  }

  async simulateSwapAndDeposit(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    userAddress: string,
  ): Promise<SimulationResult> {
    const response = await retry(() =>
      this.client.get('/v1/swap/simulate', {
        params: {
          tokenIn,
          tokenOut,
          amountIn,
          userAddress,
        },
      }),
    );
    return response.data;
  }
} 