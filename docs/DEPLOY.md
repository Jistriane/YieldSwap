<!--
🔐 ARQUIVO ASSINADO DIGITALMENTE

✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
📅 Validade: 10 anos (até 2035)
🔒 Método: RSA-4096 + SHA-512
📜 Verificação: SIGNATURE.md
⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
-->


# 🚀 Deploy Automatizado - YieldSwap

> **Guia completo para deploy dos contratos inteligentes YieldSwap**

[![Deploy Status](https://img.shields.io/badge/Deploy-Automated-success)](../scripts/)
[![Contract](https://img.shields.io/badge/Contract-Deployed-blue)](https://stellar.expert/explorer/testnet/contract/CDACQ5RS5T5CFAMV5UXNG5DUQKCAZXRZ5LUGGM7GD7SFV2KG3MLGBG2I)

---

## 📋 Índice

- [🎯 Visão Geral](#-visão-geral)
- [🔧 Pré-requisitos](#-pré-requisitos)
- [🚀 Deploy Rápido](#-deploy-rápido)
- [📝 Métodos de Deploy](#-métodos-de-deploy)
- [🔍 Verificação](#-verificação)
- [🌐 Ambientes](#-ambientes)
- [🐛 Troubleshooting](#-troubleshooting)
- [📊 Monitoramento](#-monitoramento)

---

## 🎯 Visão Geral

O YieldSwap possui um **sistema de deploy completamente automatizado** que:

- ✅ **Compila contratos** automaticamente
- ✅ **Otimiza WASM** para produção
- ✅ **Deploy em múltiplas redes** (testnet/mainnet)
- ✅ **Atualiza configurações** automaticamente
- ✅ **Verifica deploy** com testes
- ✅ **Monitora status** continuamente

---

## 🔧 Pré-requisitos

### **🛠 Dependências Obrigatórias**

```bash
# Verificar versões mínimas
node --version      # >= 18.0.0
cargo --version     # >= 1.75.0
soroban --version   # >= 20.0.0 (opcional)
stellar --version   # >= 21.0.0
```

### **📦 Instalação de Dependências**

```bash
# Rust e Soroban
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install --locked soroban-cli

# Stellar CLI (recomendado)
curl -L https://github.com/stellar/stellar-cli/releases/download/v21.0.0/stellar-21.0.0-x86_64-unknown-linux-gnu.tar.gz | tar xz
sudo mv stellar /usr/local/bin/

# Dependências do sistema (Ubuntu/Debian)
sudo apt update
sudo apt install -y build-essential pkg-config libdbus-1-dev
```

---

## 🚀 Deploy Rápido

### **⚡ Método 1: Makefile (Recomendado)**

```bash
# Deploy completo em um comando
make deploy

# Verificar deploy
make verify

# Status do deploy
make status
```

### **⚡ Método 2: Script Automático**

```bash
# Deploy interativo
./scripts/deploy-interactive.sh

# Deploy com variáveis de ambiente
export SOROBAN_SECRET_KEY="your_secret_key"
./scripts/deploy-env.sh
```

---

## 📝 Métodos de Deploy

### **🔧 1. Deploy Interativo**

**Ideal para:** Desenvolvimento local e testes

```bash
./scripts/deploy-interactive.sh
```

**O que faz:**
1. Solicita chave privada de forma segura
2. Compila contratos automaticamente
3. Executa deploy na testnet
4. Atualiza arquivos de configuração
5. Verifica deploy com testes

### **🔧 2. Deploy com Variáveis de Ambiente**

**Ideal para:** CI/CD e automação

```bash
# Configurar variável
export SOROBAN_SECRET_KEY="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# Executar deploy
./scripts/deploy-env.sh
```

### **🔧 3. Deploy via GitHub Actions**

**Ideal para:** Deploy de produção

1. **Configure Secret no GitHub:**
   ```
   Settings → Secrets → Actions → New repository secret
   Name: SOROBAN_SECRET_KEY
   Value: SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

2. **Push para branch main:**
   ```bash
   git push origin main
   ```

3. **Acompanhe o deploy:**
   - Acesse: `Actions` → `Deploy Contracts`
   - Monitore logs em tempo real

### **🔧 4. Deploy Manual Avançado**

**Ideal para:** Configurações específicas

```bash
# 1. Compilar contrato
cd packages/contracts
cargo build --release --target wasm32-unknown-unknown

# 2. Otimizar WASM
soroban contract optimize --wasm target/wasm32-unknown-unknown/release/yield_swap_router.wasm

# 3. Deploy com Stellar CLI
stellar contract deploy \
  --source alice \
  --network testnet \
  --wasm target/wasm32-unknown-unknown/release/yield_swap_router.wasm

# 4. Configurar identidade (se necessário)
stellar keys generate alice --network testnet
stellar keys fund alice --network testnet
```

---

## 🔍 Verificação

### **✅ Verificação Automática**

```bash
# Verificar deploy completo
make verify

# Ou script específico
./scripts/verify-deploy.sh
```

### **✅ Verificação Manual**

```bash
# 1. Verificar contrato no explorer
# https://stellar.expert/explorer/testnet/contract/CDACQ5RS5T5CFAMV5UXNG5DUQKCAZXRZ5LUGGM7GD7SFV2KG3MLGBG2I

# 2. Testar função do contrato
stellar contract invoke \
  --source alice \
  --network testnet \
  --id CDACQ5RS5T5CFAMV5UXNG5DUQKCAZXRZ5LUGGM7GD7SFV2KG3MLGBG2I \
  --fn get_version

# 3. Verificar configurações
cat .env.contracts
```

### **✅ Testes de Integração**

```bash
# Executar testes e2e
cd apps/api
pnpm test:e2e

# Testes específicos do contrato
cd packages/contracts
cargo test
```

---

## 🌐 Ambientes

### **🧪 Testnet (Padrão)**

```bash
# Configuração atual
Network: Stellar Testnet
RPC: https://soroban-testnet.stellar.org
Passphrase: Test SDF Network ; September 2015
Contract ID: CDACQ5RS5T5CFAMV5UXNG5DUQKCAZXRZ5LUGGM7GD7SFV2KG3MLGBG2I
```

### **🌟 Mainnet (Produção)**

```bash
# Deploy para mainnet
make deploy NETWORK=mainnet

# Ou com script
NETWORK=mainnet ./scripts/deploy-env.sh
```

### **🔧 Configuração de Rede**

```bash
# Adicionar rede customizada
stellar network add \
  --name custom \
  --rpc-url https://your-rpc-endpoint.com \
  --network-passphrase "Your Network Passphrase"

# Deploy na rede customizada
NETWORK=custom make deploy
```

---

## 🐛 Troubleshooting

### **❌ Problemas Comuns**

#### **1. Erro de Compilação Rust**

```bash
# Erro: "error: could not compile"
# Solução: Atualizar Rust
rustup update
cargo clean
cargo build --release --target wasm32-unknown-unknown
```

#### **2. Soroban CLI Incompatível**

```bash
# Erro: "JSON unmarshal error"
# Solução: Usar Stellar CLI
stellar contract deploy \
  --source alice \
  --network testnet \
  --wasm target/wasm32-unknown-unknown/release/yield_swap_router.wasm
```

#### **3. Chave Privada Inválida**

```bash
# Erro: "Invalid secret key format"
# Solução: Verificar formato
echo "SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" | wc -c  # Deve ser 57
```

#### **4. Conta Sem Fundos**

```bash
# Erro: "Insufficient balance"
# Solução: Financiar conta
stellar keys fund alice --network testnet

# Ou via Friendbot
curl "https://friendbot.stellar.org?addr=$(stellar keys address alice)"
```

#### **5. RPC Indisponível**

```bash
# Erro: "Connection refused"
# Solução: Verificar RPC
curl -X POST https://soroban-testnet.stellar.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

### **🔍 Debug Avançado**

```bash
# Logs detalhados
RUST_LOG=debug stellar contract deploy \
  --source alice \
  --network testnet \
  --wasm target/wasm32-unknown-unknown/release/yield_swap_router.wasm

# Verificar configuração
stellar config show

# Testar conectividade
stellar network ls
```

---

## 📊 Monitoramento

### **📈 Status do Deploy**

```bash
# Verificar status atual
curl -s https://stellar.expert/explorer/testnet/contract/CDACQ5RS5T5CFAMV5UXNG5DUQKCAZXRZ5LUGGM7GD7SFV2KG3MLGBG2I

# Monitorar transações
stellar contract events \
  --network testnet \
  --id CDACQ5RS5T5CFAMV5UXNG5DUQKCAZXRZ5LUGGM7GD7SFV2KG3MLGBG2I \
  --start-ledger 1000000
```

### **📊 Métricas de Deploy**

| Métrica | Valor | Status |
|---------|-------|--------|
| **Contract ID** | `CDACQ5RS5T5CFAMV5UXNG5DUQKCAZXRZ5LUGGM7GD7SFV2KG3MLGBG2I` | ✅ |
| **Network** | Stellar Testnet | ✅ |
| **Deploy Account** | `GD3EAVK7XKRHBQFHETYTGCMS5S42HUTWCDYIIR7QP4ADNSHLOYOTLSYH` | ✅ |
| **WASM Size** | ~45KB | ✅ |
| **Gas Used** | ~2.5M stroops | ✅ |

### **🔔 Alertas Automatizados**

```bash
# Script de monitoramento
#!/bin/bash
CONTRACT_ID="CDACQ5RS5T5CFAMV5UXNG5DUQKCAZXRZ5LUGGM7GD7SFV2KG3MLGBG2I"

# Verificar se contrato está ativo
if stellar contract invoke \
  --network testnet \
  --id $CONTRACT_ID \
  --fn get_version > /dev/null 2>&1; then
  echo "✅ Contract is healthy"
else
  echo "❌ Contract is down - sending alert..."
  # Enviar alerta (Slack, Discord, etc.)
fi
```

---

## 📚 Recursos Adicionais

### **🔗 Links Úteis**

- [**Stellar Explorer**](https://stellar.expert/explorer/testnet/contract/CDACQ5RS5T5CFAMV5UXNG5DUQKCAZXRZ5LUGGM7GD7SFV2KG3MLGBG2I) - Visualizar contrato
- [**Soroban Docs**](https://soroban.stellar.org) - Documentação oficial
- [**Stellar CLI**](https://github.com/stellar/stellar-cli) - Ferramenta de linha de comando
- [**Friendbot**](https://friendbot.stellar.org) - Financiar contas testnet

### **📖 Documentação Técnica**

```bash
# Estrutura do contrato
packages/contracts/src/lib.rs      # Lógica principal
packages/contracts/Cargo.toml      # Dependências
packages/contracts/target/         # Compilados

# Scripts de deploy
scripts/deploy-interactive.sh      # Deploy interativo
scripts/deploy-env.sh             # Deploy com env vars
scripts/verify-deploy.sh          # Verificação
```

### **🎯 Próximos Passos**

1. **Deploy Mainnet** - Configurar para produção
2. **Monitoring** - Implementar alertas avançados
3. **Upgrades** - Sistema de upgrade de contratos
4. **Multi-sig** - Deploy com múltiplas assinaturas

---

<div align="center">

**🚀 Deploy Automatizado YieldSwap**

*Swap + Yield em um clique - Deploy em segundos!*

[![Deploy Now](https://img.shields.io/badge/Deploy-Now-success?style=for-the-badge)](../scripts/deploy-interactive.sh)

</div> 