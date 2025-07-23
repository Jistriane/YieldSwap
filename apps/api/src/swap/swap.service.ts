import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreateRouteDto {
  sellToken: string;
  buyToken: string;
  amountIn: string;
  userAddress?: string;
}

export interface RouteResponse {
  route: {
    path: string[];
    amountOut: string;
    priceImpact: string;
  };
  minOut: string;
  gasEstimate: string;
}

@Injectable()
export class SwapService {
  constructor(private readonly configService: ConfigService) {}

  async getRoute(dto: CreateRouteDto): Promise<RouteResponse> {
    // Implementação básica para desenvolvimento
    const { sellToken, buyToken, amountIn } = dto;
    
    // Simula uma rota direta
    const path = [sellToken, buyToken];
    const amountOut = (parseFloat(amountIn) * 0.99).toString(); // 1% de slippage simulado
    const priceImpact = '0.01'; // 1% de impacto no preço
    
    return {
      route: {
        path,
        amountOut,
        priceImpact,
      },
      minOut: (parseFloat(amountOut) * 0.995).toString(), // 0.5% de slippage adicional
      gasEstimate: '100000', // 0.01 XLM
    };
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
} 