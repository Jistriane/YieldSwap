# 📁 Scripts de Deploy - YieldSwap

Esta pasta contém os scripts automatizados para deploy dos contratos Soroban do YieldSwap.

## 📋 Scripts Disponíveis

### 🚀 Deploy Scripts

| Script | Descrição | Uso |
|--------|-----------|-----|
| `deploy-xbull-automated.sh` | Deploy interativo para uso local | `./deploy-xbull-automated.sh` |
| `deploy-xbull-ci.sh` | Deploy automatizado para CI/CD | `XBULL_SECRET_KEY=xxx ./deploy-xbull-ci.sh` |
| `verify-deploy.sh` | Verifica se o deploy foi bem-sucedido | `./verify-deploy.sh` |

### 🔧 Scripts Utilitários

| Script | Descrição | Uso |
|--------|-----------|-----|
| `deploy-contracts.sh` | Script original de deploy (legado) | `./deploy-contracts.sh` |
| `create-testnet-account.js` | Cria conta na testnet | `node create-testnet-account.js` |
| `get-testnet-xlm.sh` | Solicita XLM do Friendbot | `./get-testnet-xlm.sh CHAVE_PUBLICA` |

## 🎯 Uso Rápido

### Deploy Local (Recomendado)

```bash
# Usando Makefile (mais fácil)
make deploy

# Ou diretamente
chmod +x scripts/deploy-xbull-automated.sh
./scripts/deploy-xbull-automated.sh
```

### Deploy CI/CD

```bash
# Define a chave privada
export XBULL_SECRET_KEY="SUA_CHAVE_PRIVADA_AQUI"

# Executa deploy
chmod +x scripts/deploy-xbull-ci.sh
./scripts/deploy-xbull-ci.sh
```

### Verificação

```bash
# Verifica se deploy foi bem-sucedido
chmod +x scripts/verify-deploy.sh
./scripts/verify-deploy.sh
```

## 🔐 Configuração de Segurança

### Conta xBull Configurada

- **Chave Pública**: `GALGAC3V44PCOQJG6AVU5MJNA3UTMJNMYMF3DTGMTZ2VQVPUBXZWREX7`
- **Rede**: Testnet
- **RPC**: `https://soroban-testnet.stellar.org`

### Variáveis de Ambiente

```bash
# Para deploy CI/CD
export XBULL_SECRET_KEY="sua_chave_privada_aqui"
export XBULL_PUBLIC_KEY="GALGAC3V44PCOQJG6AVU5MJNA3UTMJNMYMF3DTGMTZ2VQVPUBXZWREX7"

# Opcionais
export DEPLOY_NETWORK="testnet"
export DEPLOY_RPC_URL="https://soroban-testnet.stellar.org"
```

## 📊 Funcionalidades dos Scripts

### `deploy-xbull-automated.sh`

**Características:**
- ✅ Interface interativa amigável
- ✅ Solicita chave privada de forma segura (não armazena)
- ✅ Verifica e instala dependências automaticamente
- ✅ Compila e otimiza contratos
- ✅ Faz deploy na testnet
- ✅ Atualiza arquivos de configuração
- ✅ Exibe links do Stellar Expert
- ✅ Limpa credenciais após uso

**Processo:**
1. Verifica dependências (Rust, Soroban CLI)
2. Solicita chave privada de forma segura
3. Verifica saldo da conta (solicita do Friendbot se necessário)
4. Compila contratos Soroban
5. Otimiza arquivos WASM
6. Faz deploy na rede
7. Atualiza configurações do projeto
8. Limpa credenciais temporárias

### `deploy-xbull-ci.sh`

**Características:**
- ✅ Totalmente automatizado
- ✅ Usa variáveis de ambiente seguras
- ✅ Output estruturado para CI/CD
- ✅ Suporte a múltiplas redes
- ✅ Integração com GitHub Actions
- ✅ Logs detalhados

**Processo:**
1. Verifica variáveis de ambiente obrigatórias
2. Instala dependências se necessário
3. Configura identidade temporária
4. Compila e otimiza contratos
5. Executa deploy
6. Atualiza configurações
7. Gera output para CI/CD
8. Limpa identidades temporárias

### `verify-deploy.sh`

**Características:**
- ✅ Verifica configurações do deploy
- ✅ Testa conectividade com a rede
- ✅ Valida existência do contrato
- ✅ Verifica configurações das aplicações
- ✅ Testa RPC endpoints
- ✅ Opção para executar testes de integração

**Verificações:**
1. Arquivo `.env.contracts` existe
2. Conta existe na rede
3. Contrato foi deployado
4. Configurações do frontend/backend
5. Conectividade com RPC
6. Links do Stellar Expert funcionam

## 🌐 Redes Suportadas

### Testnet (Padrão)
```bash
NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
```

### Futurenet
```bash
NETWORK="futurenet"
RPC_URL="https://rpc-futurenet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Future Network ; October 2022"
```

## 📁 Arquivos Gerados

Após o deploy, os seguintes arquivos são criados/atualizados:

```
.env.contracts              # Configurações principais do deploy
apps/web/.env-dev          # Configurações do frontend Next.js
apps/api/.env-dev          # Configurações do backend NestJS
```

### Exemplo de `.env.contracts`:

```bash
# Deploy realizado em 2024-01-15T10:30:00Z
CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHKG2XQ6
DEPLOY_PUBLIC_KEY=GALGAC3V44PCOQJG6AVU5MJNA3UTMJNMYMF3DTGMTZ2VQVPUBXZWREX7
NETWORK=testnet
RPC_URL=https://soroban-testnet.stellar.org
DEPLOY_TIMESTAMP=2024-01-15T10:30:00Z
```

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Erro "soroban command not found"
```bash
# Instala Soroban CLI
cargo install soroban-cli --locked --force
```

#### 2. Erro de compilação
```bash
# Limpa cache e recompila
cd packages/contracts
cargo clean
cargo build --target wasm32-unknown-unknown --release
```

#### 3. Conta sem fundos
```bash
# Solicita XLM do Friendbot
curl -X POST "https://friendbot.stellar.org?addr=GALGAC3V44PCOQJG6AVU5MJNA3UTMJNMYMF3DTGMTZ2VQVPUBXZWREX7"
```

#### 4. RPC não responde
```bash
# Testa conectividade
curl -s -X POST "https://soroban-testnet.stellar.org" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

### Logs de Debug

Para mais informações de debug:

```bash
# Ativa logs verbosos
export RUST_LOG=debug
export SOROBAN_RPC_DEBUG=true

# Executa script com debug
./scripts/deploy-xbull-automated.sh
```

## 🔒 Segurança

### ⚠️ Avisos Importantes

- ❌ **NUNCA** faça commit de chaves privadas
- ❌ **NUNCA** compartilhe chaves em texto plano
- ❌ **NUNCA** armazene chaves em arquivos não criptografados
- ✅ Use sempre variáveis de ambiente para credenciais
- ✅ Use GitHub Secrets para CI/CD
- ✅ Mantenha backups seguros das chaves

### Práticas Implementadas

1. **Chaves Temporárias**: Identidades são criadas e removidas automaticamente
2. **Limpeza de Memória**: Variáveis com chaves são limpas após uso
3. **Input Seguro**: Chaves privadas são solicitadas com `-s` (sem echo)
4. **Verificação**: Scripts verificam permissões e dependências

## 📚 Documentação Adicional

- [📖 Guia Completo de Deploy](../docs/DEPLOY.md)
- [🏗️ Documentação do Soroban](https://soroban.stellar.org)
- [🌟 Stellar Expert](https://stellar.expert)
- [🤖 GitHub Actions](../.github/workflows/deploy-contracts.yml)

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique os logs de deploy
2. Execute `./scripts/verify-deploy.sh`
3. Consulte a documentação do Soroban
4. Abra uma issue no repositório

---

**Última atualização**: Janeiro 2024  
**Versão**: 1.0.0 