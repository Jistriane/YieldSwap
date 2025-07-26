/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SwapService } from './swap.service';
import { SwapRouteDto } from '../dto/swap.dto';

@ApiTags('swap')
@Controller('v1/swap')
@UseGuards(ThrottlerGuard)
export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  @Get('route')
  @ApiOperation({ summary: 'Obter rota de swap' })
  @ApiResponse({
    status: 200,
    description: 'Retorna a melhor rota para o swap',
    schema: {
      type: 'object',
      properties: {
        path: {
          type: 'array',
          items: { type: 'string' },
        },
        amountOut: { type: 'string' },
        priceImpact: { type: 'string' },
      },
    },
  })
  async getSwapRoute(@Query() query: SwapRouteDto) {
    const { tokenIn, tokenOut, amountIn } = query;
    return this.swapService.getRoute({
      sellToken: tokenIn,
      buyToken: tokenOut,
      amountIn,
      userAddress: query.userAddress,
    });
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check do serviço de swap' })
  @ApiResponse({
    status: 200,
    description: 'Status do serviço',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string' },
      },
    },
  })
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
} 