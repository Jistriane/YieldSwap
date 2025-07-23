# YieldSwap - Makefile para Deploy de Contratos
# Facilita o uso dos scripts de deploy automatizado

.PHONY: help install build deploy deploy-ci verify clean test

# Configurações
SHELL := /bin/bash
CONTRACT_DIR := packages/contracts
SCRIPTS_DIR := scripts

# Ajuda padrão
help: ## Mostra esta mensagem de ajuda
	@echo "🚀 YieldSwap - Deploy de Contratos"
	@echo ""
	@echo "Comandos disponíveis:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Exemplos:"
	@echo "  make install     # Instala dependências"
	@echo "  make build       # Compila contratos"
	@echo "  make deploy      # Deploy interativo"
	@echo "  make verify      # Verifica deploy"

install: ## Instala dependências necessárias
	@echo "🔧 Instalando dependências..."
	@if ! command -v rustc &> /dev/null; then \
		echo "Instalando Rust..."; \
		curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y; \
		source ~/.cargo/env; \
	fi
	@rustup target add wasm32-unknown-unknown
	@if ! command -v soroban &> /dev/null; then \
		echo "Instalando Soroban CLI..."; \
		cargo install soroban-cli --locked; \
	fi
	@echo "✅ Dependências instaladas"

build: ## Compila os contratos Soroban
	@echo "🏗️ Compilando contratos..."
	@cd $(CONTRACT_DIR) && cargo build --target wasm32-unknown-unknown --release
	@echo "✅ Contratos compilados"

test: ## Executa testes dos contratos
	@echo "🧪 Executando testes..."
	@cd $(CONTRACT_DIR) && cargo test
	@echo "✅ Testes concluídos"

deploy: install build ## Deploy interativo dos contratos (requer chave privada)
	@echo "🚀 Iniciando deploy interativo..."
	@./$(SCRIPTS_DIR)/deploy-xbull-automated.sh

deploy-ci: ## Deploy via CI/CD (usa variáveis de ambiente)
	@echo "🤖 Iniciando deploy CI/CD..."
	@if [ -z "$$XBULL_SECRET_KEY" ]; then \
		echo "❌ Erro: Variável XBULL_SECRET_KEY não definida"; \
		echo "   Execute: export XBULL_SECRET_KEY='sua_chave_privada'"; \
		exit 1; \
	fi
	@./$(SCRIPTS_DIR)/deploy-xbull-ci.sh

verify: ## Verifica se o deploy foi realizado corretamente
	@echo "🔍 Verificando deploy..."
	@./$(SCRIPTS_DIR)/verify-deploy.sh

clean: ## Limpa arquivos de build
	@echo "🧹 Limpando arquivos de build..."
	@cd $(CONTRACT_DIR) && cargo clean
	@rm -f .env.contracts
	@echo "✅ Limpeza concluída"

status: ## Mostra status atual do deploy
	@echo "📊 Status do Deploy:"
	@echo ""
	@if [ -f ".env.contracts" ]; then \
		echo "✅ Arquivo de configuração encontrado:"; \
		cat .env.contracts | sed 's/^/   /'; \
		echo ""; \
	else \
		echo "❌ Nenhum deploy encontrado"; \
		echo "   Execute 'make deploy' para fazer o deploy"; \
		echo ""; \
	fi

logs: ## Mostra logs do último deploy (se disponível)
	@echo "📝 Logs do Deploy:"
	@echo ""
	@if [ -f ".env.contracts" ]; then \
		source .env.contracts; \
		echo "Contract ID: $$CONTRACT_ID"; \
		echo "Public Key:  $$DEPLOY_PUBLIC_KEY"; \
		echo "Network:     $$NETWORK"; \
		echo "Timestamp:   $$DEPLOY_TIMESTAMP"; \
		echo ""; \
		echo "🔗 Links:"; \
		echo "  Conta:    https://stellar.expert/explorer/$$NETWORK/account/$$DEPLOY_PUBLIC_KEY"; \
		echo "  Contrato: https://stellar.expert/explorer/$$NETWORK/contract/$$CONTRACT_ID"; \
	else \
		echo "❌ Nenhum deploy encontrado"; \
	fi

setup-github: ## Configura secrets do GitHub para CI/CD
	@echo "⚙️ Configuração do GitHub Actions:"
	@echo ""
	@echo "1. Vá para Settings > Secrets and variables > Actions"
	@echo "2. Adicione os seguintes secrets:"
	@echo ""
	@echo "   XBULL_SECRET_KEY"
	@echo "   Valor: [sua_chave_privada_xbull]"
	@echo ""
	@echo "3. (Opcional) Adicione a variável:"
	@echo ""
	@echo "   XBULL_PUBLIC_KEY"
	@echo "   Valor: GALGAC3V44PCOQJG6AVU5MJNA3UTMJNMYMF3DTGMTZ2VQVPUBXZWREX7"
	@echo ""
	@echo "4. O deploy automático será ativado em pushes para main/develop"

info: ## Mostra informações sobre a conta xBull
	@echo "ℹ️ Informações da Conta xBull:"
	@echo ""
	@echo "  Chave Pública: GALGAC3V44PCOQJG6AVU5MJNA3UTMJNMYMF3DTGMTZ2VQVPUBXZWREX7"
	@echo "  Rede:          Testnet"
	@echo "  RPC:           https://soroban-testnet.stellar.org"
	@echo ""
	@echo "🔗 Links úteis:"
	@echo "  Stellar Expert: https://stellar.expert/explorer/testnet/account/GALGAC3V44PCOQJG6AVU5MJNA3UTMJNMYMF3DTGMTZ2VQVPUBXZWREX7"
	@echo "  Friendbot:      https://friendbot.stellar.org"
	@echo ""
	@echo "📚 Documentação:"
	@echo "  Deploy Guide:   docs/DEPLOY.md"
	@echo "  Soroban Docs:   https://soroban.stellar.org"

# Aliases para facilitar o uso
d: deploy ## Alias para deploy
v: verify ## Alias para verify
s: status ## Alias para status
i: info ## Alias para info

# Comando composto para deploy completo
deploy-full: install build deploy verify ## Executa o processo completo de deploy

# Comando para desenvolvimento local
dev-setup: install build ## Configura ambiente de desenvolvimento
	@echo "🛠️ Ambiente de desenvolvimento configurado"
	@echo "   Execute 'make deploy' para fazer o deploy" 