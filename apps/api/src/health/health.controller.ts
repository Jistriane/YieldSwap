import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar saúde do sistema' })
  @ApiResponse({
    status: 200,
    description: 'Retorna o status de saúde de todos os serviços',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string' },
        uptime: { type: 'number' },
        redis: {
          type: 'object',
          properties: {
            connected: { type: 'boolean' },
            latencyMs: { type: 'number' },
          },
        },
        rpc: {
          type: 'object',
          properties: {
            connected: { type: 'boolean' },
            latencyMs: { type: 'number' },
            blockHeight: { type: 'number' },
          },
        },
      },
    },
  })
  async check(): Promise<any> {
    return this.healthService.check();
  }
} 