# 🚀 Deploy YieldSwap na Vercel - Stellar Testnet

Este guia detalha como fazer o deploy do frontend YieldSwap na Vercel, configurado para funcionar com a testnet da Stellar.

## 📋 Pré-requisitos

### 1. Conta na Vercel
- Crie uma conta em [vercel.com](https://vercel.com)
- Conecte sua conta GitHub (recomendado)

### 2. Vercel CLI
```bash
npm install -g vercel
```

### 3. Dependências do Projeto
```bash
pnpm install
```

## 🛠️ Configuração

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no painel da Vercel ou use o arquivo `env.production.example`:

```env
# Stellar Testnet Configuration
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_STELLAR_PASSPHRASE="Test SDF Network ; September 2015"

# API Configuration
NEXT_PUBLIC_API_URL=https://yieldswap-api.vercel.app
NEXT_PUBLIC_WEBSOCKET_URL=wss://yieldswap-api.vercel.app

# Freighter Wallet Configuration
NEXT_PUBLIC_FREIGHTER_NETWORK=testnet

# Contract Configuration (atualizar após deploy do contrato)
NEXT_PUBLIC_SOROBAN_CONTRACT_ID=PLACEHOLDER_CONTRACT_ID

# App Configuration
NEXT_PUBLIC_APP_NAME=YieldSwap
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENVIRONMENT=testnet

# Security (opcional)
NEXT_PUBLIC_SENTRY_DSN=YOUR_SENTRY_DSN_HERE
```

### 2. Configuração do vercel.json

O arquivo `vercel.json` já está configurado com:
- ✅ Configurações otimizadas para Next.js
- ✅ Headers de segurança
- ✅ Rewrites para API
- ✅ Variáveis de ambiente da testnet

## 🚀 Deploy Automático

### Opção 1: Script Automatizado
```bash
./scripts/deploy-vercel.sh
```

### Opção 2: Deploy Manual

1. **Login na Vercel**
```bash
vercel login
```

2. **Build do Projeto**
```bash
cd apps/web
pnpm build
```

3. **Deploy**
```bash
vercel --prod
```

## 🔧 Configuração Pós-Deploy

### 1. Painel da Vercel

Acesse [vercel.com/dashboard](https://vercel.com/dashboard) e:

1. **Selecione seu projeto YieldSwap**
2. **Vá para Settings → Environment Variables**
3. **Configure as variáveis listadas acima**
4. **Faça redeploy se necessário**

### 2. Domínio Customizado (Opcional)

1. **Vá para Settings → Domains**
2. **Adicione seu domínio**
3. **Configure DNS conforme instruções**

### 3. Configuração da Carteira Freighter

Para testar na testnet:

1. **Instale a extensão Freighter**
2. **Crie/importe uma conta de teste**
3. **Configure para Testnet**:
   - Abra Freighter
   - Settings → Network
   - Selecione "Testnet"

### 4. Obter XLM de Teste

```bash
# Friendbot para conseguir XLM na testnet
curl "https://friendbot.stellar.org?addr=SEU_ENDEREÇO_PUBLICO"
```

## 🧪 Teste da Aplicação

### 1. Funcionalidades Básicas
- [ ] Carregamento da página
- [ ] Seletor de idiomas (PT/EN/ES)
- [ ] Responsividade mobile
- [ ] Animações e efeitos visuais

### 2. Integração Stellar
- [ ] Conexão com Freighter
- [ ] Exibição do endereço da carteira
- [ ] Verificação da rede (testnet)
- [ ] Simulação de swap

### 3. Performance
- [ ] Lighthouse Score > 90
- [ ] Tempo de carregamento < 3s
- [ ] PWA funcionando

## 🔍 Monitoramento

### 1. Logs da Vercel
```bash
vercel logs
```

### 2. Analytics
- Acesso via painel da Vercel
- Métricas de performance
- Relatórios de erro

### 3. Sentry (Opcional)
Se configurado, monitore erros em tempo real.

## 🚨 Troubleshooting

### Erro de Build
```bash
# Limpar cache
rm -rf apps/web/.next
pnpm install
cd apps/web && pnpm build
```

### Erro de Variáveis de Ambiente
1. Verifique se todas as variáveis estão configuradas
2. Redeploy após alterações
3. Verifique sintaxe das variáveis

### Erro de Conexão Stellar
1. Verifique se Freighter está em testnet
2. Confirme URLs da testnet
3. Verifique console do navegador

### Performance Issues
1. Analise bundle size
2. Otimize imagens
3. Configure caching adequado

## 📊 URLs Importantes

- **Frontend Produção**: `https://yieldswap.vercel.app`
- **Stellar Testnet RPC**: `https://soroban-testnet.stellar.org`
- **Stellar Horizon**: `https://horizon-testnet.stellar.org`
- **Friendbot**: `https://friendbot.stellar.org`

## 🔄 Atualizações

### Deploy Contínuo
Configure webhook no GitHub para deploy automático:

1. **Vercel Dashboard → Git**
2. **Conecte repositório GitHub**
3. **Configure branch de produção (main)**

### Rollback
```bash
vercel rollback [deployment-url]
```

## 🎯 Próximos Passos

1. **Deploy do Backend API**
2. **Deploy dos Smart Contracts**
3. **Configuração de domínio próprio**
4. **Setup de monitoramento completo**
5. **Testes de integração end-to-end**

---

**📝 Nota**: Este deploy está configurado para **Stellar Testnet**. Para produção na mainnet, atualize as variáveis de ambiente correspondentes.

**🔐 Segurança**: Nunca exponha chaves privadas em variáveis de ambiente do frontend. Use apenas chaves públicas e endpoints seguros. 