#!/bin/bash

# YieldSwap System Startup Script
# Versão: 2.0 - Atualizado com deploy automatizado

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# PIDs dos processos
API_PID=""
WEB_PID=""
SERVICES_PID=""

# Função de ajuda
show_help() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    YieldSwap System                          ║"
    echo "║              Sistema de Inicialização v2.0                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${CYAN}Uso:${NC} $0 [opções]"
    echo ""
    echo -e "${CYAN}Opções:${NC}"
    echo "  -h, --help     Mostra esta ajuda"
    echo "  -v, --version  Mostra a versão"
    echo "  --skip-deploy  Pula verificação de deploy"
    echo "  --skip-build   Pula compilação de contratos"
    echo ""
    echo -e "${CYAN}Exemplos:${NC}"
    echo "  $0                    # Inicia sistema completo"
    echo "  $0 --skip-deploy     # Inicia sem verificar deploy"
    echo "  $0 --skip-build      # Inicia sem compilar contratos"
    echo ""
    exit 0
}

# Processa argumentos da linha de comando
SKIP_DEPLOY=false
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            ;;
        -v|--version)
            echo "YieldSwap System v2.0"
            exit 0
            ;;
        --skip-deploy)
            SKIP_DEPLOY=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        *)
            error "Opção desconhecida: $1"
            echo "Use '$0 --help' para ver as opções disponíveis."
            exit 1
            ;;
    esac
done

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    YieldSwap System                          ║"
echo "║              Sistema de Inicialização v2.0                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Função para log com timestamp
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ ERRO:${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  AVISO:${NC} $1"
}

info() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  INFO:${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ SUCESSO:${NC} $1"
}

# Verifica se deploy foi realizado
check_deploy() {
    log "Verificando deploy dos contratos..."
    
    if [ -f ".env.contracts" ]; then
        source .env.contracts
        if [ -n "$CONTRACT_ID" ]; then
            success "Contrato deployado encontrado: $CONTRACT_ID"
            info "Rede: $NETWORK"
            info "Conta: $DEPLOY_PUBLIC_KEY"
            return 0
        fi
    fi
    
    warn "Nenhum deploy encontrado. Execute 'make deploy' primeiro."
    read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Deploy necessário para funcionamento completo"
        exit 1
    fi
}

# Verifica dependências
check_dependencies() {
    log "Verificando dependências do sistema..."
    
    local missing_deps=()
    
    # Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js 18+")
    else
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            missing_deps+=("Node.js 18+ (versão atual: v$NODE_VERSION)")
        else
            success "Node.js $(node --version) ✓"
        fi
    fi
    
    # pnpm ou npm
    if [ -z "$PACKAGE_MANAGER" ]; then
        if ! command -v pnpm &> /dev/null; then
            if ! command -v npm &> /dev/null; then
                missing_deps+=("pnpm ou npm")
            else
                warn "pnpm não encontrado. Usando npm como alternativa..."
                success "npm $(npm --version) ✓"
                PACKAGE_MANAGER="npm"
            fi
        else
            success "pnpm $(pnpm --version) ✓"
            PACKAGE_MANAGER="pnpm"
        fi
    else
        info "Usando gerenciador de pacotes definido: $PACKAGE_MANAGER"
        if [ "$PACKAGE_MANAGER" = "pnpm" ] && command -v pnpm &> /dev/null; then
            success "pnpm $(pnpm --version) ✓"
        elif [ "$PACKAGE_MANAGER" = "npm" ] && command -v npm &> /dev/null; then
            success "npm $(npm --version) ✓"
        else
            missing_deps+=("$PACKAGE_MANAGER não encontrado")
        fi
    fi
    
    # Redis
    if ! command -v redis-cli &> /dev/null; then
        missing_deps+=("Redis 7+")
    else
        success "Redis disponível ✓"
    fi
    
    # Rust (opcional para desenvolvimento)
    if ! command -v cargo &> /dev/null; then
        warn "Rust não encontrado (opcional para desenvolvimento de contratos)"
    else
        success "Rust $(rustc --version | cut -d' ' -f2) ✓"
    fi
    
    # Soroban CLI (opcional)
    if ! command -v soroban &> /dev/null; then
        warn "Soroban CLI não encontrado (opcional para deploy de contratos)"
    else
        success "Soroban CLI disponível ✓"
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        error "Dependências faltando:"
        for dep in "${missing_deps[@]}"; do
            echo "   - $dep"
        done
        exit 1
    fi
}

# Verifica serviços
check_services() {
    log "Verificando serviços..."
    
    # Redis
    if ! redis-cli ping &> /dev/null; then
        warn "Redis não está rodando. Tentando iniciar..."
        sudo systemctl start redis-server
        sleep 2
        if ! redis-cli ping &> /dev/null; then
            error "Falha ao iniciar Redis"
            exit 1
        fi
    fi
}

# Configura variáveis de ambiente
setup_env() {
    log "Configurando variáveis de ambiente..."
    
    # Carrega informações do deploy se disponível
    CONTRACT_ID=""
    DEPLOY_PUBLIC_KEY=""
    NETWORK="testnet"
    
    if [ -f ".env.contracts" ]; then
        source .env.contracts
        success "Configurações do deploy carregadas"
    fi
    
    # API
    if [ ! -f "apps/api/.env-dev" ]; then
        info "Criando .env-dev para API..."
        cat > apps/api/.env-dev << EOL
# YieldSwap API Configuration
PORT=3001
NODE_ENV=development

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Stellar/Soroban Configuration
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NETWORK_PASSPHRASE=Test SDF Network ; September 2015
STELLAR_NETWORK=testnet

# Contract Configuration (Auto-updated from deploy)
$([ -n "$CONTRACT_ID" ] && echo "YIELD_SWAP_CONTRACT_ID=$CONTRACT_ID" || echo "YIELD_SWAP_CONTRACT_ID=YOUR_CONTRACT_ID")

# Security
SENTRY_DSN=YOUR_SENTRY_DSN
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=30

# Logging
LOG_LEVEL=info
EOL
        success "Arquivo .env-dev criado para API"
    else
        # Atualiza CONTRACT_ID se disponível
        if [ -n "$CONTRACT_ID" ]; then
            if ! grep -q "YIELD_SWAP_CONTRACT_ID=$CONTRACT_ID" apps/api/.env-dev; then
                sed -i '/YIELD_SWAP_CONTRACT_ID=/d' apps/api/.env-dev
                echo "YIELD_SWAP_CONTRACT_ID=$CONTRACT_ID" >> apps/api/.env-dev
                success "Contract ID atualizado na API"
            fi
        fi
    fi
    
    # Web
    if [ ! -f "apps/web/.env-dev" ]; then
        info "Criando .env-dev para Web..."
        cat > apps/web/.env-dev << EOL
# YieldSwap Web Configuration
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Stellar/Soroban Configuration
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# Contract Configuration (Auto-updated from deploy)
$([ -n "$CONTRACT_ID" ] && echo "NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID" || echo "NEXT_PUBLIC_CONTRACT_ID=YOUR_CONTRACT_ID")

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=YOUR_SENTRY_DSN

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
EOL
        success "Arquivo .env-dev criado para Web"
    else
        # Atualiza CONTRACT_ID se disponível
        if [ -n "$CONTRACT_ID" ]; then
            if ! grep -q "NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID" apps/web/.env-dev; then
                sed -i '/NEXT_PUBLIC_CONTRACT_ID=/d' apps/web/.env-dev
                echo "NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID" >> apps/web/.env-dev
                success "Contract ID atualizado no Web"
            fi
        fi
    fi
    
    # Exibe informações do ambiente
    echo ""
    info "📋 Configuração do Ambiente:"
    echo "   • API: http://localhost:3001"
    echo "   • Web: http://localhost:3000"
    echo "   • Rede: $NETWORK"
    [ -n "$CONTRACT_ID" ] && echo "   • Contrato: $CONTRACT_ID"
    echo ""
}

# Instala dependências
install_deps() {
    log "Instalando dependências..."
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm install
    else
        npm install
    fi
}

# Compila contratos
build_contracts() {
    log "Verificando contratos..."
    
    if [ ! -d "packages/contracts" ]; then
        warn "Diretório de contratos não encontrado. Pulando compilação..."
        return 0
    fi
    
    cd packages/contracts
    
    # Verifica se precisa compilar
    if [ ! -f "target/wasm32-unknown-unknown/release/yield_swap_router.wasm" ] || [ "src/" -nt "target/" ]; then
        info "Compilando contratos Rust..."
        
        # Verifica se o target wasm32 está instalado
        if ! rustup target list --installed | grep -q "wasm32-unknown-unknown"; then
            info "Instalando target wasm32-unknown-unknown..."
            rustup target add wasm32-unknown-unknown
        fi
        
        # Compila os contratos
        if cargo build --release --target wasm32-unknown-unknown; then
            success "Contratos compilados com sucesso ✓"
        else
            warn "Falha na compilação dos contratos (continuando sem eles)"
        fi
    else
        success "Contratos já compilados ✓"
    fi
    
    cd ../..
}

# Função para verificar se porta está em uso
check_port() {
    local port=$1
    if command -v lsof &> /dev/null; then
        lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1
    else
        ss -tlnp | grep -q ":$port "
    fi
}

# Inicia serviços em background
start_services() {
    log "Iniciando serviços YieldSwap em modo desenvolvimento..."
    
    # Verifica se as portas estão livres
    if check_port 3001; then
        warn "Porta 3001 já está em uso. Parando processo..."
        pkill -f "port.*3001" || true
        pkill -f ":3001" || true
        sleep 2
    fi
    
    if check_port 3000; then
        warn "Porta 3000 já está em uso. Parando processo..."
        pkill -f "port.*3000" || true
        pkill -f ":3000" || true
        sleep 2
    fi
    
    # Inicia serviços usando turbo dev (mais simples e funcional)
    info "🚀 Iniciando todos os serviços com Turbo..."
    
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm dev > services.log 2>&1 &
    else
        npx turbo dev > services.log 2>&1 &
    fi
    
    SERVICES_PID=$!
    info "Serviços iniciados (PID: $SERVICES_PID)"
    
    # Aguarda serviços iniciarem
    info "Aguardando serviços iniciarem..."
    sleep 15
    
    # Verifica se os serviços estão rodando
    local api_ok=false
    local web_ok=false
    
    for i in {1..15}; do
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            api_ok=true
            break
        fi
        sleep 2
    done
    
    for i in {1..15}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            web_ok=true
            break
        fi
        sleep 2
    done
    
    if [ "$api_ok" = false ]; then
        error "API não iniciou corretamente na porta 3001"
        echo "Logs dos serviços:"
        [ -f "services.log" ] && tail -20 services.log
        cleanup
        exit 1
    fi
    
    if [ "$web_ok" = false ]; then
        error "Web não iniciou corretamente na porta 3000"
        echo "Logs dos serviços:"
        [ -f "services.log" ] && tail -20 services.log
        cleanup
        exit 1
    fi
    
    success "Todos os serviços iniciados com sucesso!"
}

# Função de limpeza
cleanup() {
    echo ""
    log "🛑 Parando serviços YieldSwap..."
    
    # Para processo principal dos serviços
    if [ -n "$SERVICES_PID" ]; then
        info "Parando processo principal (PID: $SERVICES_PID)..."
        kill -TERM $SERVICES_PID 2>/dev/null || true
        sleep 3
        kill -KILL $SERVICES_PID 2>/dev/null || true
        info "Processo principal parado"
    fi
    
    # Para processos individuais se existirem
    if [ -n "$API_PID" ]; then
        kill -TERM $API_PID 2>/dev/null || true
        info "API parada (PID: $API_PID)"
    fi
    
    if [ -n "$WEB_PID" ]; then
        kill -TERM $WEB_PID 2>/dev/null || true
        info "Web parado (PID: $WEB_PID)"
    fi
    
    # Força parada de processos relacionados
    info "Forçando parada de processos relacionados..."
    pkill -f "turbo dev" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "nest start" 2>/dev/null || true
    pkill -f "port.*3001" 2>/dev/null || true
    pkill -f "port.*3000" 2>/dev/null || true
    pkill -f ":3001" 2>/dev/null || true
    pkill -f ":3000" 2>/dev/null || true
    
    # Aguarda um momento para garantir que os processos pararam
    sleep 2
    
    # Remove logs temporários
    rm -f services.log apps/api.log apps/web.log 2>/dev/null || true
    
    success "Todos os serviços foram parados"
    exit 0
}

# Função para exibir status
show_status() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                     YIELDSWAP STATUS                        ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Status da API
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "🚀 ${GREEN}API:${NC} ✅ Rodando em http://localhost:3001"
    else
        echo -e "🚀 ${RED}API:${NC} ❌ Não está respondendo"
    fi
    
    # Status do Web
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "🌐 ${GREEN}Web:${NC} ✅ Rodando em http://localhost:3000"
    else
        echo -e "🌐 ${RED}Web:${NC} ❌ Não está respondendo"
    fi
    
    # Status do Redis
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "💾 ${GREEN}Redis:${NC} ✅ Conectado"
    else
        echo -e "💾 ${RED}Redis:${NC} ❌ Desconectado"
    fi
    
    # Informações do contrato
    if [ -f ".env.contracts" ]; then
        source .env.contracts
        echo -e "📋 ${GREEN}Contrato:${NC} ✅ $CONTRACT_ID"
        echo -e "🌐 ${GREEN}Rede:${NC} $NETWORK"
    else
        echo -e "📋 ${YELLOW}Contrato:${NC} ⚠️  Não deployado"
    fi
    
    echo ""
    echo -e "${CYAN}Comandos úteis:${NC}"
    echo "  • Ctrl+C: Parar todos os serviços"
    echo "  • make deploy: Deploy dos contratos"
    echo "  • make verify: Verificar deploy"
    echo ""
}

# Registra cleanup para SIGINT e SIGTERM
trap cleanup SIGINT SIGTERM

# Função principal
main() {
    log "🚀 Iniciando sistema YieldSwap..."
    echo ""
    
    # Executa verificações e configurações
    if [ "$SKIP_DEPLOY" = false ]; then
        check_deploy
    else
        info "Pulando verificação de deploy (--skip-deploy)"
    fi
    
    check_dependencies
    check_services
    setup_env
    install_deps
    
    if [ "$SKIP_BUILD" = false ]; then
        build_contracts
    else
        info "Pulando compilação de contratos (--skip-build)"
    fi
    
    start_services
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                  YIELDSWAP INICIADO!                        ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    show_status
    
    info "Sistema rodando... Pressione Ctrl+C para parar"
    
    # Monitora serviços e exibe status periodicamente
    while true; do
        sleep 30
        
        # Verifica se os serviços ainda estão rodando
        if [ -n "$SERVICES_PID" ] && ! kill -0 $SERVICES_PID 2>/dev/null; then
            error "Serviços pararam inesperadamente!"
            cleanup
            exit 1
        fi
        
        # Verifica se as portas ainda estão respondendo
        if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
            warn "API não está respondendo na porta 3001"
        fi
        
        if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
            warn "Web não está respondendo na porta 3000"
        fi
    done
}

# Executa função principal
main 