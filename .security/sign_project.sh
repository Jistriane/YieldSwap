#!/bin/bash
set -e

# Configurações
SECURITY_DIR=".security"
PRIVATE_KEY="$SECURITY_DIR/private.key"
PUBLIC_KEY="$SECURITY_DIR/public.key"
MANIFEST="$SECURITY_DIR/manifest.json"
SIGNATURE="$SECURITY_DIR/signature.sha512"
CERT_FILE="$SECURITY_DIR/certificate.pem"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para imprimir mensagens
log() {
    echo -e "${BLUE}[YieldSwap]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

# Verifica se já existe a estrutura
if [ ! -d "$SECURITY_DIR" ]; then
    mkdir -p "$SECURITY_DIR"
    chmod 700 "$SECURITY_DIR"
fi

# Usa senha do ambiente ou solicita
if [ -z "$YIELDSWAP_PASSWORD" ]; then
    log "Digite sua senha de assinatura:"
    read -s PASSWORD
    echo
else
    PASSWORD="$YIELDSWAP_PASSWORD"
fi

# Valida senha
if [ ${#PASSWORD} -lt 12 ]; then
    error "A senha deve ter pelo menos 12 caracteres"
    exit 1
fi

# Gera chaves se não existirem
if [ ! -f "$PRIVATE_KEY" ]; then
    log "Gerando par de chaves RSA-4096..."
    openssl genpkey -algorithm RSA -aes256 -pass pass:"$PASSWORD" \
        -pkeyopt rsa_keygen_bits:4096 -out "$PRIVATE_KEY"
    openssl rsa -pubout -in "$PRIVATE_KEY" -passin pass:"$PASSWORD" -out "$PUBLIC_KEY"
    chmod 600 "$PRIVATE_KEY"
    chmod 644 "$PUBLIC_KEY"
    success "Chaves geradas com sucesso"
fi

# Gera certificado se não existir
if [ ! -f "$CERT_FILE" ]; then
    log "Gerando certificado digital..."
    openssl req -x509 -new -nodes -key "$PRIVATE_KEY" -passin pass:"$PASSWORD" \
        -sha512 -days 3650 \
        -subj "/C=BR/ST=Brazil/L=Brazil/O=Jistriane Projects/OU=Blockchain Development/CN=Jistriane Brunielli Silva de Oliveira" \
        -out "$CERT_FILE"
    chmod 644 "$CERT_FILE"
    success "Certificado gerado com sucesso"
fi

# Gera manifest do projeto
log "Gerando manifest do projeto..."
{
    echo '{'
    echo '  "project": "YieldSwap",'
    echo '  "author": "Jistriane Brunielli Silva de Oliveira",'
    echo '  "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",'
    echo '  "certificate": "'$(openssl x509 -noout -fingerprint -sha512 -in "$CERT_FILE" | cut -d= -f2)'",'
    echo '  "files": ['
    
    # Lista todos os arquivos (exceto .git, node_modules e .security)
    find . -type f \
        ! -path "./.git/*" \
        ! -path "./node_modules/*" \
        ! -path "./.security/*" \
        ! -path "./*/node_modules/*" \
        ! -path "./*/target/*" \
        ! -path "./*/dist/*" \
        -exec sha512sum {} \; | while read -r hash file; do
        echo "    {"
        echo "      \"path\": \"${file:2}\","
        echo "      \"sha512\": \"$hash\""
        echo "    },"
    done | sed '$ s/,$//'
    
    echo '  ],'
    echo '  "validity": {'
    echo '    "start": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",'
    echo '    "end": "'$(date -u -d "+10 years" +"%Y-%m-%dT%H:%M:%SZ")'"'
    echo '  }'
    echo '}'
} > "$MANIFEST"

# Assina o manifest
log "Assinando projeto..."
openssl dgst -sha512 -sign "$PRIVATE_KEY" -passin pass:"$PASSWORD" \
    -out "$SIGNATURE" "$MANIFEST"

# Verifica a assinatura
if openssl dgst -sha512 -verify "$PUBLIC_KEY" \
    -signature "$SIGNATURE" "$MANIFEST" > /dev/null 2>&1; then
    success "Projeto assinado com sucesso!"
    success "📜 Assinatura: $SIGNATURE"
    success "📋 Manifest: $MANIFEST"
    success "🔒 Certificado: $CERT_FILE"
    success "📅 Validade: 10 anos"
else
    error "Falha na verificação da assinatura!"
    exit 1
fi 