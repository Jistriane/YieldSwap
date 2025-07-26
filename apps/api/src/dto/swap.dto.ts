/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import { IsString, IsOptional, IsNumberString } from 'class-validator';

export class SwapRouteDto {
  @IsString()
  tokenIn: string;

  @IsString()
  tokenOut: string;

  @IsNumberString()
  amountIn: string;

  @IsOptional()
  @IsString()
  userAddress?: string;
} 