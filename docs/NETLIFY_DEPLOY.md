# 🚀 Deploy YieldSwap Backend na Netlify - Stellar Testnet

Este guia detalha como fazer o deploy completo do backend YieldSwap na Netlify, configurado para funcionar com a rede testnet da Stellar.

## 📋 Pré-requisitos

### 1. Conta na Netlify
- Crie uma conta em [netlify.com](https://netlify.com)
- Conecte sua conta GitHub (recomendado)

### 2. Ferramentas Necessárias
```bash
# Node.js 18+
node --version

# pnpm (gerenciador de pacotes)
npm install -g pnpm

# Netlify CLI
npm install -g netlify-cli

# Git (para controle de versão)
git --version
```

### 3. Dependências do Projeto
```bash
# No diretório raiz do projeto
pnpm install
```

## 🛠️ Configuração

### 1. Estrutura de Arquivos

O projeto está configurado com a seguinte estrutura para Netlify:

```
YieldSwap/
├── netlify.toml                    # Configuração principal da Netlify
├── netlify/functions/              # Funções serverless
│   ├── api.js                     # Função principal da API NestJS
│   ├── health.js                  # Health check especializado
│   └── docs.js                    # Documentação Swagger
├── apps/api/                      # Código fonte da API
│   ├── src/main.netlify.ts       # Entry point otimizado para serverless
│   └── .env-netlify               # Configurações de produção
└── scripts/deploy-netlify.sh      # Script automatizado de deploy
```

### 2. Configuração do netlify.toml

O arquivo `netlify.toml` já está configurado com:

- ✅ **Build Command**: `pnpm install && pnpm build:api && pnpm build:functions`
- ✅ **Functions Directory**: `netlify/functions`
- ✅ **Redirects**: API routes para `/api/*`, `/health`, `/docs`
- ✅ **Headers de Segurança**: CSP, CORS, Security headers
- ✅ **Environment Variables**: Stellar testnet configuration
- ✅ **Node.js 18**: Runtime otimizado

### 3. Variáveis de Ambiente

As seguintes variáveis são configuradas automaticamente:

```env
# Ambiente
NODE_ENV=production
PORT=8888

# Stellar Testnet
STELLAR_NETWORK=testnet
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# CORS
CORS_ORIGIN=https://yieldswap.netlify.app

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# Contract (atualizado automaticamente)
YIELD_SWAP_CONTRACT_ID=PLACEHOLDER_CONTRACT_ID

# Features
ENABLE_SWAGGER=true
ENABLE_CORS=true
ENABLE_HELMET=true
ENABLE_THROTTLING=true
```

## 🚀 Deploy Automático

### Opção 1: Script Automatizado (Recomendado)

```bash
# Deploy completo
./scripts/deploy-netlify.sh

# Deploy sem rebuild (mais rápido)
./scripts/deploy-netlify.sh --skip-build

# Apenas verificar deploy existente
./scripts/deploy-netlify.sh --verify-only
```

### Opção 2: Deploy Manual

1. **Login na Netlify**
```bash
netlify login
```

2. **Build do Projeto**
```bash
pnpm install
pnpm build:api
```

3. **Deploy**
```bash
netlify deploy --prod --build
```

## 🔧 Configuração Pós-Deploy

### 1. Verificação Automática

O script de deploy verifica automaticamente:

- ✅ Health check endpoint (`/health`)
- ✅ Documentação Swagger (`/docs`)
- ✅ Conectividade com Stellar testnet
- ✅ Configuração de variáveis de ambiente

### 2. URLs Importantes

Após o deploy, você terá acesso a:

- **🌐 API Principal**: `https://yieldswap-api.netlify.app`
- **🏥 Health Check**: `https://yieldswap-api.netlify.app/health`
- **📚 Documentação**: `https://yieldswap-api.netlify.app/docs`
- **💱 Swap Endpoint**: `https://yieldswap-api.netlify.app/api/v1/swap/route`

### 3. Monitoramento

```bash
# Ver logs em tempo real
netlify logs

# Status do site
netlify status

# Informações do deploy
netlify deploys
```

## 🧪 Teste da Aplicação

### 1. Health Check

```bash
# Teste básico
curl https://yieldswap-api.netlify.app/health

# Resposta esperada
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "stellar": {
    "horizon": { "connected": true },
    "soroban": { "connected": true }
  },
  "contract": {
    "configured": true,
    "contractId": "CDACQ5...",
    "network": "testnet"
  }
}
```

### 2. Documentação Swagger

Acesse `https://yieldswap-api.netlify.app/docs` para:

- ✅ Interface interativa da API
- ✅ Teste de endpoints em tempo real
- ✅ Documentação completa
- ✅ Exemplos de requisições

### 3. Endpoint de Swap

```bash
# Teste do roteamento de swap
curl "https://yieldswap-api.netlify.app/api/v1/swap/route?tokenIn=XLM&tokenOut=USDC&amountIn=100"

# Resposta esperada
{
  "route": {
    "path": ["XLM", "USDC"],
    "amountOut": "99.0",
    "priceImpact": "0.01"
  },
  "minOut": "98.505",
  "gasEstimate": "100000"
}
```

## 🔒 Segurança

### 1. Headers de Segurança

Configurados automaticamente:

- ✅ **CSP**: Content Security Policy restritiva
- ✅ **CORS**: Configurado para domínios permitidos
- ✅ **Helmet**: Proteções de segurança padrão
- ✅ **Rate Limiting**: 100 req/min por IP

### 2. Variáveis Sensíveis

⚠️ **Importante**: Configure no painel da Netlify:

```bash
# No painel da Netlify (Site settings → Environment variables)
SENTRY_DSN=your_sentry_dsn_here
STELLAR_PRIVATE_KEY=your_private_key_here  # Se necessário
```

### 3. CORS Configurado

- ✅ **Produção**: `https://yieldswap.netlify.app`
- ✅ **Deploy Previews**: `https://deploy-preview-*.yieldswap.netlify.app`
- ✅ **Desenvolvimento**: `http://localhost:3000`

## 🌐 Integração com Frontend

### 1. Configuração no Frontend

```env
# apps/web/.env.production
NEXT_PUBLIC_API_URL=https://yieldswap-api.netlify.app
NEXT_PUBLIC_WS_URL=wss://yieldswap-api.netlify.app
```

### 2. Exemplo de Uso

```typescript
// Configuração da API no frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://yieldswap-api.netlify.app';

// Exemplo de requisição
const response = await fetch(`${API_BASE_URL}/api/v1/swap/route?tokenIn=XLM&tokenOut=USDC&amountIn=100`);
const data = await response.json();
```

## 🔄 CI/CD e Deploy Contínuo

### 1. GitHub Integration

Configure no painel da Netlify:

1. **Site settings → Build & deploy**
2. **Link repository**: Conecte seu repositório GitHub
3. **Build settings**:
   - **Base directory**: `./`
   - **Build command**: `pnpm install && pnpm build:api && pnpm build:functions`
   - **Publish directory**: `apps/api/dist`

### 2. Deploy Automático

```bash
# Qualquer push para main fará deploy automático
git push origin main

# Deploy previews para pull requests
git push origin feature-branch
```

### 3. Webhooks

Configure webhooks para:
- ✅ Deploy automático no push
- ✅ Deploy previews em PRs
- ✅ Notificações de status

## 🐛 Troubleshooting

### 1. Problemas Comuns

#### **Build Failures**

```bash
# Limpar cache e rebuildar
rm -rf node_modules apps/api/node_modules apps/api/dist
pnpm install
pnpm build:api

# Ou usar o script
./scripts/deploy-netlify.sh --skip-deps
```

#### **Function Timeout**

```toml
# Aumentar timeout no netlify.toml
[functions]
  timeout = 30  # segundos
```

#### **Environment Variables**

```bash
# Verificar variáveis configuradas
netlify env:list

# Configurar variável específica
netlify env:set VARIABLE_NAME "value"
```

### 2. Logs e Debug

```bash
# Logs das functions
netlify logs

# Debug local
netlify dev

# Testar functions localmente
netlify functions:serve
```

### 3. Stellar Network Issues

```bash
# Testar conectividade
curl https://horizon-testnet.stellar.org/
curl https://soroban-testnet.stellar.org/

# Verificar contract ID
./scripts/verify-deploy.sh
```

## 📊 Monitoramento

### 1. Netlify Analytics

- **Performance**: Tempo de resposta das functions
- **Usage**: Número de invocações
- **Errors**: Rate de erro das functions
- **Bandwidth**: Uso de dados

### 2. Health Monitoring

```bash
# Configurar monitoramento externo
# Pingdom, UptimeRobot, etc.
# URL: https://yieldswap-api.netlify.app/health
```

### 3. Sentry Integration

```javascript
// Configurado automaticamente no código
// Monitora erros em tempo real
// Dashboard: https://sentry.io
```

## 🚀 Otimizações

### 1. Performance

- ✅ **Function Caching**: Reutilização de instâncias NestJS
- ✅ **Cold Start**: Otimizado para inicialização rápida
- ✅ **Bundle Size**: Minimizado com esbuild
- ✅ **Memory Usage**: Configurado para 1024MB

### 2. Caching

```javascript
// Cache em memória para functions
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
```

### 3. Bundle Optimization

```toml
# netlify.toml
[functions]
  node_bundler = "esbuild"
  external_node_modules = ["@nestjs/core", "@nestjs/common"]
```

## 📈 Scaling

### 1. Function Limits

- **Timeout**: 10 segundos (configurável até 30s)
- **Memory**: 1024MB (configurável)
- **Concurrent**: 1000 execuções simultâneas
- **Bandwidth**: Ilimitado

### 2. Rate Limiting

```javascript
// Configurado no código
const RATE_LIMIT = {
  ttl: 60, // segundos
  limit: 100, // requests por IP
};
```

## 🎯 Próximos Passos

1. **✅ Deploy do Backend** (Concluído)
2. **🔄 Deploy do Frontend** (Next.js na Netlify)
3. **📱 Deploy dos Contratos** (Soroban na testnet)
4. **🔗 Integração Completa** (Frontend + Backend + Contracts)
5. **🧪 Testes End-to-End**
6. **📊 Monitoramento Completo**

---

## 🆘 Suporte

### Comandos Úteis

```bash
# Deploy completo
./scripts/deploy-netlify.sh

# Verificar status
netlify status

# Ver logs
netlify logs

# Deploy local para teste
netlify dev

# Rollback se necessário
netlify rollback
```

### Links Importantes

- **📚 Documentação**: `https://yieldswap-api.netlify.app/docs`
- **🏥 Health Check**: `https://yieldswap-api.netlify.app/health`
- **🌐 Netlify Dashboard**: `https://app.netlify.com`
- **⭐ Stellar Expert**: `https://stellar.expert/explorer/testnet`

---

**🎉 Parabéns!** Seu backend YieldSwap está agora rodando na Netlify com configuração completa para Stellar Testnet! 