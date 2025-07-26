/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { SwapModule } from './swap/swap.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env-dev', '.env-homolog', '.env-prod'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get('RATE_LIMIT_TTL', 60) * 1000,
            limit: config.get('RATE_LIMIT_LIMIT', 30),
          },
        ],
      }),
    }),
    HealthModule,
    SwapModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {} 