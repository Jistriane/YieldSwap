/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


const https = require('https');
const { promisify } = require('util');

// Função para fazer requisições HTTP
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        try {
          resolve({
            status: response.statusCode,
            data: JSON.parse(data),
            headers: response.headers
          });
        } catch (error) {
          resolve({
            status: response.statusCode,
            data: data,
            headers: response.headers
          });
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Verificar conectividade com Stellar Testnet
async function checkStellarNetwork() {
  try {
    const horizonUrl = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
    const response = await makeRequest(`${horizonUrl}/`);
    
    return {
      connected: response.status === 200,
      latencyMs: Date.now() - Date.now(), // Placeholder
      network: response.data?.network_passphrase || 'Unknown',
      horizonVersion: response.data?.horizon_version || 'Unknown',
      coreVersion: response.data?.stellar_core_version || 'Unknown',
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      latencyMs: null,
    };
  }
}

// Verificar RPC Soroban
async function checkSorobanRPC() {
  try {
    const rpcUrl = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
    const response = await makeRequest(`${rpcUrl}/`);
    
    return {
      connected: response.status === 200,
      latencyMs: Date.now() - Date.now(), // Placeholder
      version: response.data?.version || 'Unknown',
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      latencyMs: null,
    };
  }
}

// Verificar configuração do contrato
function checkContractConfig() {
  const contractId = process.env.YIELD_SWAP_CONTRACT_ID;
  
  return {
    configured: contractId && contractId !== 'PLACEHOLDER_CONTRACT_ID',
    contractId: contractId || 'Not configured',
    network: process.env.STELLAR_NETWORK || 'testnet',
  };
}

exports.handler = async (event, context) => {
  // Configuração para não aguardar event loop vazio
  context.callbackWaitsForEmptyEventLoop = false;

  const startTime = Date.now();

  try {
    // Executar verificações em paralelo
    const [stellarCheck, sorobanCheck] = await Promise.allSettled([
      checkStellarNetwork(),
      checkSorobanRPC(),
    ]);

    const contractConfig = checkContractConfig();
    const uptime = process.uptime ? process.uptime() : 0;
    const responseTime = Date.now() - startTime;

    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      responseTime: `${responseTime}ms`,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        network: process.env.STELLAR_NETWORK || 'testnet',
        region: process.env.AWS_REGION || 'unknown',
      },
      stellar: {
        horizon: stellarCheck.status === 'fulfilled' ? stellarCheck.value : { 
          connected: false, 
          error: stellarCheck.reason?.message || 'Check failed' 
        },
        soroban: sorobanCheck.status === 'fulfilled' ? sorobanCheck.value : { 
          connected: false, 
          error: sorobanCheck.reason?.message || 'Check failed' 
        },
      },
      contract: contractConfig,
      netlify: {
        functionName: context.functionName || 'health',
        functionVersion: context.functionVersion || '1.0.0',
        memoryLimitInMB: context.memoryLimitInMB || 'unknown',
        remainingTimeInMS: context.getRemainingTimeInMillis ? context.getRemainingTimeInMillis() : 'unknown',
      },
    };

    // Determinar status geral
    const allHealthy = stellarCheck.status === 'fulfilled' && 
                      stellarCheck.value.connected &&
                      sorobanCheck.status === 'fulfilled' && 
                      sorobanCheck.value.connected;

    if (!allHealthy) {
      healthData.status = 'degraded';
    }

    return {
      statusCode: allHealthy ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      body: JSON.stringify(healthData, null, 2),
    };

  } catch (error) {
    console.error('Erro no health check:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        uptime: process.uptime ? process.uptime() : 0,
        environment: {
          nodeEnv: process.env.NODE_ENV || 'development',
          network: process.env.STELLAR_NETWORK || 'testnet',
        },
      }, null, 2),
    };
  }
}; 