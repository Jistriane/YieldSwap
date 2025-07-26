/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setupSentry } from './sentry';
import { ConfigService } from '@nestjs/config';

// Cache global da aplicação para reutilização em funções serverless
let cachedApp: any = null;

export async function createNestApp() {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    const app = await NestFactory.create(AppModule, {
      logger: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn'] 
        : ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);

    // Configurar Sentry para monitoramento
    setupSentry(configService);

    // Middlewares de segurança otimizados para serverless
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: [
            "'self'", 
            process.env.CORS_ORIGIN || "*",
            "https://soroban-testnet.stellar.org",
            "https://horizon-testnet.stellar.org",
            "wss://*.netlify.app"
          ],
          fontSrc: ["'self'", "https://unpkg.com"],
        },
      },
      crossOriginEmbedderPolicy: false, // Necessário para Swagger UI
    }));

    // CORS otimizado para Netlify
    app.enableCors({
      origin: (origin, callback) => {
        // Permitir requisições sem origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          process.env.CORS_ORIGIN,
          'https://yieldswap.netlify.app',
          'https://deploy-preview-*.yieldswap.netlify.app',
          'http://localhost:3000',
          'http://localhost:3001',
        ].filter(Boolean);

        // Permitir qualquer deploy preview da Netlify
        if (origin.includes('.netlify.app')) {
          return callback(null, true);
        }

        if (allowedOrigins.some(allowed => allowed === '*' || origin === allowed)) {
          callback(null, true);
        } else {
          callback(new Error('Não permitido pelo CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-API-Key'
      ],
      credentials: true,
      maxAge: 86400, // 24 horas de cache para preflight
    });

    // Pipes de validação globais
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
      validationError: {
        target: false,
        value: false,
      },
    }));

    // Configuração do Swagger para produção
    if (process.env.ENABLE_SWAGGER !== 'false') {
      const config = new DocumentBuilder()
        .setTitle(process.env.API_TITLE || 'YieldSwap API - Stellar Testnet')
        .setDescription(process.env.API_DESCRIPTION || `
          🚀 API do YieldSwap para Stellar Testnet
          
          Esta API fornece endpoints para swap de tokens e yield farming na rede testnet da Stellar.
          
          ## Funcionalidades:
          - 💱 Swap de tokens com roteamento inteligente
          - 📊 Consulta de APY e vaults
          - 🏥 Health checks e monitoramento
          - 📈 Métricas de performance
          
          ## Rede: Stellar Testnet
          - RPC: ${process.env.SOROBAN_RPC_URL}
          - Horizon: ${process.env.STELLAR_HORIZON_URL}
          - Network: ${process.env.STELLAR_NETWORK}
        `)
        .setVersion(process.env.API_VERSION || '1.0.0')
        .setContact(
          'YieldSwap Team',
          'https://github.com/yieldswap/yieldswap',
          'dev@yieldswap.finance'
        )
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .addServer(
          process.env.NODE_ENV === 'production' 
            ? 'https://yieldswap-api.netlify.app' 
            : 'http://localhost:8888',
          process.env.NODE_ENV === 'production' 
            ? 'Produção (Netlify Functions)' 
            : 'Desenvolvimento Local'
        )
        .addTag('health', '🏥 Health Check e Status')
        .addTag('swap', '💱 Swap e Roteamento')
        .addTag('apy', '📊 APY e Yield Farming')
        .addTag('metrics', '📈 Métricas e Analytics')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document, {
        customSiteTitle: 'YieldSwap API - Stellar Testnet',
        customfavIcon: '/favicon.ico',
        customJs: [
          'https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-bundle.min.js',
        ],
        customCssUrl: [
          'https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui.min.css',
        ],
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          docExpansion: 'list',
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
          tryItOutEnabled: true,
          requestInterceptor: (req: any) => {
            // Adicionar headers customizados para todas as requisições
            req.headers['X-API-Source'] = 'swagger-ui';
            req.headers['X-Stellar-Network'] = process.env.STELLAR_NETWORK || 'testnet';
            return req;
          },
        },
      });
    }

    // Inicializar aplicação sem escutar porta (serverless)
    await app.init();
    
    cachedApp = app;
    return app;

  } catch (error) {
    console.error('❌ Erro ao inicializar aplicação NestJS:', error);
    throw error;
  }
}

// Função para limpeza de recursos (chamada em graceful shutdown)
export async function closeNestApp() {
  if (cachedApp) {
    await cachedApp.close();
    cachedApp = null;
  }
}

// Handler para desenvolvimento local
export async function bootstrap() {
  try {
    const app = await createNestApp();
    
    const port = process.env.PORT || 8888;
    await app.listen(port);
    
    console.log(`🚀 YieldSwap API rodando na porta ${port}`);
    console.log(`📚 Documentação: http://localhost:${port}/docs`);
    console.log(`🏥 Health Check: http://localhost:${port}/health`);
    console.log(`🌐 Rede: ${process.env.STELLAR_NETWORK || 'testnet'}`);
    console.log(`⚡ RPC: ${process.env.SOROBAN_RPC_URL}`);

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Recebido SIGTERM, encerrando aplicação...');
  await closeNestApp();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Recebido SIGINT, encerrando aplicação...');
  await closeNestApp();
  process.exit(0);
});

// Capturar exceções não tratadas
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Executar se for chamado diretamente (desenvolvimento local)
if (require.main === module) {
  bootstrap();
} 