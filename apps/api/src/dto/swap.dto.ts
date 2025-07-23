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