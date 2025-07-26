<!--
🔐 ARQUIVO ASSINADO DIGITALMENTE

✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
📅 Validade: 10 anos (até 2035)
🔒 Método: RSA-4096 + SHA-512
📜 Verificação: SIGNATURE.md
⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
-->


# YieldSwap 🌟

**Complete DeFi platform for swap and yield farming on the Stellar network**

[![Deploy Status](https://img.shields.io/badge/Deploy-Live-brightgreen)](https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app)
[![Frontend Status](https://img.shields.io/badge/Frontend-Live-brightgreen)](https://web-2qcbrj87a-jistrianes-projects.vercel.app)
[![API Status](https://img.shields.io/badge/API-Online-success)](https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/health)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-blue)](https://stellar.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Digital Signature](https://img.shields.io/badge/Signed-RSA_4096-red)](SIGNATURE.en.md)

## 🚀 **Production Deploy - COMPLETE SYSTEM ACTIVE**

### 🌐 **Functional URLs:**

- **🎨 Frontend**: `https://web-2qcbrj87a-jistrianes-projects.vercel.app`
- **🚀 Main API**: `https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app`
- **🏥 Health Check**: `https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/health`
- **📚 API Documentation**: `https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/docs`
- **💱 Swap Endpoint**: `https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/v1/swap/route`

### ⚙️ **Network Configuration:**
- **🔗 Network:** Stellar Testnet
- **⚡ RPC:** `https://soroban-testnet.stellar.org`
- **🌊 Horizon:** `https://horizon-testnet.stellar.org`
- **💰 Supported Tokens:** XLM, USDC, USDT, BTC, ETH, AQUA, YBX

## 📋 **Overview**

YieldSwap is an advanced DeFi platform that combines:

- **🔄 Smart Swap** - Optimized routing with multiple protocols
- **📈 Yield Farming** - Automated yield strategies
- **⚡ Real-time APY** - Data updated via WebSocket
- **🛡️ Risk Analysis** - Complete liquidity and impact assessment
- **🌍 Multi-language** - Support for PT, EN, ES
- **🔐 Security** - Security headers, CORS configured, Rate limiting

## 🏗️ **Project Architecture**

```
YieldSwap/
├── 🚀 apps/
│   ├── api/                    # 🔧 NestJS Backend (DEPLOYED)
│   │   ├── src/
│   │   │   ├── swap/          # 💱 Swap module
│   │   │   ├── apy/           # 📊 APY module
│   │   │   ├── auth/          # 🔐 Authentication
│   │   │   ├── health/        # 🏥 Health checks
│   │   │   └── main.netlify.ts # ⚡ Serverless entry point
│   │   ├── .env-netlify       # 🌐 Production config
│   │   └── test/              # 🧪 Integration tests
│   └── web/                   # 🎨 Next.js Frontend
│       ├── components/        # 🧩 React components
│       ├── hooks/            # 🎣 Custom hooks
│       ├── lib/              # 🛠️ Utilities
│       └── src/              # 📁 Source code
├── 📦 packages/
│   ├── contracts/            # 🦀 Soroban smart contracts
│   ├── sdk/                  # 📚 TypeScript SDK
│   └── ui/                   # 🎨 UI library
├── 📚 libs/
│   ├── redis-client/         # 🔴 Redis client
│   ├── shared-types/         # 🔷 Shared types
│   └── soroban-helpers/      # ⭐ Stellar utilities
├── 🚀 scripts/               # Automation scripts
│   ├── deploy-netlify.sh     # 🎯 Automated deploy
│   └── verify-deploy.sh      # ✅ Deploy verification
├── 📊 docs/                  # Complete documentation
│   ├── NETLIFY_DEPLOY.md     # 🌐 Netlify deploy guide
│   └── VERCEL_DEPLOY.md      # ☁️ Vercel deploy guide
└── ⚙️ Root configurations
    ├── netlify.toml          # 🌐 Netlify config
    ├── vercel.json           # ☁️ Vercel config (ACTIVE)
    ├── package.json          # 📦 Monorepo config
    └── turbo.json            # ⚡ Turbo config
```

## 🛠️ **Technology Stack**

### **Backend (DEPLOYED ✅)**
- **🔧 NestJS** - Robust Node.js framework
- **⚡ Vercel Functions** - Serverless deployment
- **🔴 Redis** - Cache and sessions (simulated in production)
- **🌐 WebSocket** - Real-time communication
- **📚 Swagger** - Interactive API documentation
- **🔍 Sentry** - Error monitoring
- **🛡️ Helmet** - Security headers
- **⏱️ Rate Limiting** - Spam protection

### **Frontend**
- **⚛️ Next.js 14** - React framework with SSG/SSR
- **📘 TypeScript 5** - Static typing
- **🎨 Tailwind CSS** - Utility-first styling
- **⚛️ Jotai** - State management
- **🔄 React Query** - Data cache and synchronization
- **📱 PWA** - Progressive Web App
- **🌍 i18next** - Internationalization

### **Blockchain**
- **⭐ Stellar** - Blockchain network (Testnet)
- **🦀 Soroban** - Smart contracts
- **👛 Freighter** - Wallet integration
- **🌊 Horizon API** - Blockchain data

## 🚀 **Installation and Execution**

### **Prerequisites**
```bash
# Node.js 18+
node --version

# pnpm (package manager)
npm install -g pnpm

# Freighter Wallet (browser extension)
# https://freighter.app/
```

### **Quick Installation**
```bash
# Clone the repository
git clone https://github.com/your-username/YieldSwap.git
cd YieldSwap

# Install dependencies
pnpm install

# Configure environment variables
cp apps/api/.env-netlify apps/api/.env-dev
cp env.production.example .env.local
```

### **Local Development**
```bash
# Start complete system
./scripts/start-system.sh

# Or individually:
# API Backend
pnpm dev:api

# Frontend Web
cd apps/web && pnpm dev

# Production build
pnpm build
```

## 🌐 **Deploy and Production**

### **🚀 Automated Deploy (ACTIVE)**

The backend is deployed on **Vercel** with complete configuration:

```bash
# Complete deploy (already done)
./scripts/deploy-netlify.sh

# Verify deploy
curl https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/health
```

### **📊 Monitoring**

- **🏥 Health Check**: API status and Stellar connectivity
- **📈 Metrics**: Performance and resource usage
- **🔍 Logs**: Real-time monitoring via Vercel
- **⚠️ Alerts**: Error notifications via Sentry

## 🧪 **Testing the API**

### **1. Health Check**
```bash
curl https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "uptime": 1234.567,
  "redis": { "connected": true, "latencyMs": 5 },
  "rpc": { "connected": true, "latencyMs": 100, "blockHeight": 12345 },
  "oracle": { "lastUpdate": 1642248000000, "staleness": 0 }
}
```

### **2. Interactive Documentation**
Access: `https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/docs`

### **3. Swap Endpoint**
```bash
curl "https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/v1/swap/route?tokenIn=XLM&tokenOut=USDC&amountIn=100"
```

**Expected response:**
```json
{
  "route": {
    "path": ["XLM", "USDC"],
    "amountOut": "99",
    "priceImpact": "0.01"
  },
  "minOut": "98.505",
  "gasEstimate": "100000"
}
```

## 🔐 **Security**

### **Cryptographic Protection**
- ✅ **[Digital Signature](SIGNATURE.en.md)** - RSA-4096 + SHA-512
- ✅ **X.509 Certificate** - 10 years validity
- ✅ **Signed Manifest** - Verifiable integrity
- ✅ **Public Key** - Transparent verification

### **Implemented Practices**
- ✅ **Input Validation** - Complete sanitization
- ✅ **CORS Configured** - Controlled origins
- ✅ **Rate Limiting** - 100 req/min per IP
- ✅ **Security Headers** - CSP, XSS Protection, etc.
- ✅ **HTTPS Only** - Encrypted communication
- ✅ **Secrets Management** - Secure variables
- ✅ **Wallet Security** - No private key storage

### **Production Configuration**
```env
# Stellar Testnet (Safe for development)
STELLAR_NETWORK=testnet
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# Security
CORS_ORIGIN=*  # Configured for development
RATE_LIMIT_LIMIT=100
ENABLE_HELMET=true
```

## 📚 **Complete Documentation**

- **📖 [Netlify Deploy](docs/NETLIFY_DEPLOY.md)** - Complete Netlify guide
- **☁️ [Vercel Deploy](docs/VERCEL_DEPLOY.md)** - Complete Vercel guide
- **🚀 [Deploy Summary](DEPLOY_NETLIFY_RESUMO.md)** - Quick instructions
- **🔧 [Scripts](scripts/README.md)** - Scripts documentation
- **📊 [Architecture](YIELDSWAP_FULL_DOCUMENTATION.md)** - Technical documentation

## 🎯 **Roadmap**

### **✅ Completed**
- [x] **Backend API** - Deployed on Vercel
- [x] **Frontend UI** - Deployed on Vercel
- [x] **Health Checks** - Active monitoring
- [x] **Documentation** - Functional Swagger UI
- [x] **Security** - Headers and validations
- [x] **Stellar Integration** - Testnet configured
- [x] **Complete Integration** - Frontend + Backend functional

### **🔄 In Progress**
- [ ] **Soroban Contracts** - Testnet deployment
- [ ] **E2E Tests** - Cypress/Playwright
- [ ] **Advanced Monitoring** - Grafana/Prometheus

### **📅 Planned**
- [ ] **CI/CD Pipeline** - GitHub Actions
- [ ] **Mainnet Deploy** - Stellar Production
- [ ] **Mobile App** - React Native

## 🤝 **Contributing**

```bash
# Fork the project
git clone https://github.com/your-username/YieldSwap.git

# Create a branch
git checkout -b feature/new-feature

# Commit your changes
git commit -m "feat: adds new feature"

# Push to the branch
git push origin feature/new-feature

# Open a Pull Request
```

## 📞 **Support**

### **Useful Links**
- **🌐 Live API**: `https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app`
- **📚 Documentation**: `https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/docs`
- **🏥 Status**: `https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/health`
- **⭐ Stellar Explorer**: `https://stellar.expert/explorer/testnet`
- **👛 Freighter Wallet**: `https://freighter.app`

### **Useful Commands**
```bash
# Check deploy status
curl https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/health

# Complete deploy
./scripts/deploy-netlify.sh

# Check logs
vercel logs

# Test endpoints
curl "https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/v1/swap/route?tokenIn=XLM&tokenOut=USDC&amountIn=100"
```

## 📄 **License**

This project is under the MIT license. See the [LICENSE](LICENSE) file for more details.

---

## 🎉 **Project Status**

**✅ COMPLETE SYSTEM DEPLOYED AND FUNCTIONAL**  
**🎨 FRONTEND ONLINE ON VERCEL**  
**🌐 API ONLINE ON VERCEL**  
**📚 DOCUMENTATION ACTIVE**  
**🔐 SECURITY CONFIGURED**  
**⭐ STELLAR TESTNET INTEGRATED**

**🚀 System in production and ready to use!**

---

**Developed with ❤️ for the Stellar community** 