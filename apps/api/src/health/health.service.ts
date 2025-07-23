import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  async check(): Promise<any> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      redis: {
        connected: true, // Simulado
        latencyMs: 5,
      },
      rpc: {
        connected: true, // Simulado
        latencyMs: 100,
        blockHeight: 12345,
      },
      oracle: {
        lastUpdate: Date.now(),
        staleness: 0,
      },
    };
  }
} 