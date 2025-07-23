const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { AppModule } = require('../../apps/api/dist/app.module');
const serverless = require('serverless-http');
const express = require('express');

let cachedApp;

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  
  const app = await NestFactory.create(AppModule, adapter, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Configuração de CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  // Configuração de prefixo global para API
  app.setGlobalPrefix('api');

  await app.init();
  
  cachedApp = serverless(expressApp, {
    binary: ['image/*', 'application/pdf'],
  });

  return cachedApp;
}

exports.handler = async (event, context) => {
  // Configuração para reutilizar conexões
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const app = await createApp();
    return await app(event, context);
  } catch (error) {
    console.error('Erro na função serverless:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
        timestamp: new Date().toISOString(),
      }),
    };
  }
}; 