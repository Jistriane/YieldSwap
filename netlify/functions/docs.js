const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { AppModule } = require('../../apps/api/dist/app.module');
const express = require('express');

let cachedSwaggerDocument;

async function createSwaggerDocument() {
  if (cachedSwaggerDocument) {
    return cachedSwaggerDocument;
  }

  try {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    
    const app = await NestFactory.create(AppModule, adapter, {
      logger: false, // Desabilita logs para documentação
    });

    // Configuração do Swagger
    const config = new DocumentBuilder()
      .setTitle('YieldSwap API - Stellar Testnet')
      .setDescription(`
        🚀 **API do YieldSwap para Stellar Testnet**
        
        Esta API fornece endpoints para swap de tokens e yield farming na rede testnet da Stellar.
        
        ## 🌟 Funcionalidades Principais
        
        ### 💱 Swap
        - Roteamento inteligente de trades
        - Simulação de transações
        - Melhor preço garantido
        
        ### 📊 APY (Annual Percentage Yield)
        - Consulta de APY por ativo
        - Busca automática do melhor vault
        - Atualizações em tempo real
        
        ### 🏥 Health Check
        - Status da API
        - Conectividade com Stellar
        - Configuração de contratos
        
        ## 🔗 Rede Stellar Testnet
        
        - **RPC URL**: ${process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'}
        - **Horizon URL**: ${process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'}
        - **Network**: ${process.env.STELLAR_NETWORK || 'testnet'}
        - **Passphrase**: ${process.env.NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015'}
        
        ## 🔐 Autenticação
        
        Esta API não requer autenticação para endpoints públicos. 
        Para operações que envolvem transações, utilize a carteira Freighter.
        
        ## 📈 Rate Limiting
        
        - **Limite**: ${process.env.RATE_LIMIT_LIMIT || '100'} requisições por minuto
        - **TTL**: ${process.env.RATE_LIMIT_TTL || '60'} segundos
        
        ## 🐛 Suporte
        
        Para reportar bugs ou solicitar funcionalidades, acesse nosso repositório no GitHub.
      `)
      .setVersion('1.0.0')
      .setContact(
        'YieldSwap Team',
        'https://github.com/yieldswap/yieldswap',
        'dev@yieldswap.finance'
      )
      .setLicense(
        'MIT License',
        'https://opensource.org/licenses/MIT'
      )
      .addServer(
        process.env.NODE_ENV === 'production' 
          ? 'https://yieldswap-api.netlify.app' 
          : 'http://localhost:8888',
        process.env.NODE_ENV === 'production' ? 'Produção (Netlify)' : 'Desenvolvimento Local'
      )
      .addTag('health', '🏥 Health Check - Status da API e conectividade')
      .addTag('swap', '💱 Swap - Roteamento e execução de trades')
      .addTag('apy', '📊 APY - Consulta de rendimentos e vaults')
      .addTag('metrics', '📈 Métricas - Estatísticas e performance')
      .build();

    cachedSwaggerDocument = SwaggerModule.createDocument(app, config);
    
    await app.close();
    return cachedSwaggerDocument;
    
  } catch (error) {
    console.error('Erro ao criar documentação Swagger:', error);
    
    // Fallback para documentação básica
    return {
      openapi: '3.0.0',
      info: {
        title: 'YieldSwap API - Stellar Testnet',
        description: 'API para swap de tokens e yield farming na Stellar Testnet',
        version: '1.0.0',
      },
      servers: [
        {
          url: process.env.NODE_ENV === 'production' 
            ? 'https://yieldswap-api.netlify.app' 
            : 'http://localhost:8888',
          description: process.env.NODE_ENV === 'production' ? 'Produção' : 'Desenvolvimento'
        }
      ],
      paths: {
        '/health': {
          get: {
            tags: ['health'],
            summary: 'Health Check',
            description: 'Verifica o status da API e conectividade com Stellar',
            responses: {
              '200': {
                description: 'API funcionando normalmente',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'ok' },
                        timestamp: { type: 'string', format: 'date-time' },
                        uptime: { type: 'number' },
                        stellar: { type: 'object' },
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/api/v1/swap/route': {
          get: {
            tags: ['swap'],
            summary: 'Obter Rota de Swap',
            description: 'Calcula a melhor rota para swap entre dois tokens',
            parameters: [
              {
                name: 'tokenIn',
                in: 'query',
                required: true,
                schema: { type: 'string' },
                description: 'Token de origem'
              },
              {
                name: 'tokenOut',
                in: 'query',
                required: true,
                schema: { type: 'string' },
                description: 'Token de destino'
              },
              {
                name: 'amountIn',
                in: 'query',
                required: true,
                schema: { type: 'string' },
                description: 'Quantidade a ser trocada'
              }
            ],
            responses: {
              '200': {
                description: 'Rota calculada com sucesso',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        route: {
                          type: 'object',
                          properties: {
                            path: { type: 'array', items: { type: 'string' } },
                            amountOut: { type: 'string' },
                            priceImpact: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const document = await createSwaggerDocument();
    
    // Se a requisição é para o JSON da documentação
    if (event.path.includes('/docs.json') || event.queryStringParameters?.format === 'json') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
        },
        body: JSON.stringify(document, null, 2),
      };
    }

    // Caso contrário, retorna a interface HTML do Swagger
    const swaggerHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YieldSwap API - Documentação</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.10.5/favicon-32x32.png" sizes="32x32" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .swagger-ui .topbar {
      background-color: #1f2937;
    }
    .swagger-ui .topbar .download-url-wrapper {
      display: none;
    }
    .custom-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
    }
    .custom-header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5em;
      font-weight: 700;
    }
    .custom-header p {
      margin: 0;
      font-size: 1.2em;
      opacity: 0.9;
    }
    .network-info {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 15px;
      margin: 20px;
      text-align: center;
    }
    .network-badge {
      display: inline-block;
      background: #28a745;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8em;
      font-weight: 600;
      text-transform: uppercase;
      margin: 0 5px;
    }
  </style>
</head>
<body>
  <div class="custom-header">
    <h1>🚀 YieldSwap API</h1>
    <p>Swap e Yield Farming na Stellar Testnet</p>
  </div>
  
  <div class="network-info">
    <strong>🌐 Rede Ativa:</strong>
    <span class="network-badge">Testnet</span>
    <br><br>
    <small>
      <strong>RPC:</strong> ${process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'} |
      <strong>Horizon:</strong> ${process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'}
    </small>
  </div>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: window.location.origin + window.location.pathname + '?format=json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        tryItOutEnabled: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        docExpansion: "list",
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        persistAuthorization: true,
        displayRequestDuration: true,
        requestInterceptor: function(request) {
          // Adiciona headers personalizados se necessário
          request.headers['X-API-Source'] = 'swagger-ui';
          return request;
        },
        responseInterceptor: function(response) {
          // Log de respostas para debug
          if (window.location.hostname === 'localhost') {
            console.log('API Response:', response);
          }
          return response;
        }
      });
    };
  </script>
</body>
</html>`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=1800', // Cache por 30 minutos
      },
      body: swaggerHtml,
    };

  } catch (error) {
    console.error('Erro na documentação:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      },
      body: JSON.stringify({
        error: 'Erro interno do servidor',
        message: 'Não foi possível carregar a documentação',
        timestamp: new Date().toISOString(),
      }),
    };
  }
}; 