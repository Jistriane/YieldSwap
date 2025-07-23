import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('YieldSwap API')
    .setDescription(`
      API para o YieldSwap - Swap e Yield em um único clique.
      
      ## Recursos Principais
      
      ### APY
      - Consulta de APY por ativo
      - Busca do melhor vault
      - WebSocket para atualizações em tempo real
      
      ### Swap
      - Roteamento de trades
      - Simulação de transações
      - Construção de XDR
      
      ### Segurança
      - Rate limiting por IP
      - Validação de parâmetros
      - Headers de segurança
      
      ## Ambientes
      - Produção: https://api.yieldswap.finance
      - Staging: https://api.staging.yieldswap.finance
      - Local: http://localhost:3000
    `)
    .setVersion('1.0')
    .addTag('apy', 'Endpoints relacionados a APY e vaults')
    .addTag('swap', 'Endpoints relacionados a swap e roteamento')
    .addTag('health', 'Endpoints de health check e métricas')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'YieldSwap API Docs',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
  });
} 