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

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Middlewares de segurança
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", process.env.CORS_ORIGIN || "*"],
        },
      },
    }));

    // CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    // Pipes de validação
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));

    // Configuração do Swagger
    const config = new DocumentBuilder()
      .setTitle('YieldSwap API')
      .setDescription('API para swap de tokens e yield farming')
      .setVersion('1.0')
      .addTag('health', 'Health check endpoints')
      .addTag('apy', 'APY related endpoints')
      .addTag('swap', 'Swap related endpoints')
      .addTag('metrics', 'Metrics endpoints')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // Iniciar servidor
    const port = process.env.PORT || process.env.API_PORT || 3001;
    await app.listen(port);
    console.log(`🚀 YieldSwap API rodando na porta ${port}`);
    console.log(`📚 Documentação disponível em: http://localhost:${port}/docs`);
    console.log(`🏥 Health check em: http://localhost:${port}/health`);
  } catch (error) {
    console.error('❌ Erro ao iniciar a aplicação:', error);
    process.exit(1);
  }
}

bootstrap(); 