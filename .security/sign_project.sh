#!/bin/bash
set -e

# Configurações
SECURITY_DIR=".security"
PRIVATE_KEY="$SECURITY_DIR/private.key"
PUBLIC_KEY="$SECURITY_DIR/public.key"
MANIFEST="$SECURITY_DIR/manifest.json"
SIGNATURE="$SECURITY_DIR/signature.sha512"
CERT_FILE="$SECURITY_DIR/certificate.pem"

# Verifica se já existe a estrutura
if [ ! -d "$SECURITY_DIR" ]; then
    mkdir -p "$SECURITY_DIR"
    chmod 700 "$SECURITY_DIR"
fi

# Solicita senha
echo "Digite sua senha de assinatura:"
read -s PASSWORD
echo

# Gera chaves se não existirem
if [ ! -f "$PRIVATE_KEY" ]; then
    echo "Gerando par de chaves RSA-4096..."
    openssl genpkey -algorithm RSA -aes256 -pass pass:"$PASSWORD" \
        -pkeyopt rsa_keygen_bits:4096 -out "$PRIVATE_KEY"
    openssl rsa -pubout -in "$PRIVATE_KEY" -passin pass:"$PASSWORD" -out "$PUBLIC_KEY"
    chmod 600 "$PRIVATE_KEY"
    chmod 644 "$PUBLIC_KEY"
fi

# Gera certificado se não existir
if [ ! -f "$CERT_FILE" ]; then
    echo "Gerando certificado digital..."
    openssl req -x509 -new -nodes -key "$PRIVATE_KEY" -passin pass:"$PASSWORD" \
        -sha512 -days 3650 \
        -subj "/C=BR/ST=Brazil/L=Brazil/O=Jistriane Projects/OU=Blockchain Development/CN=Jistriane Brunielli Silva de Oliveira" \
        -out "$CERT_FILE"
    chmod 644 "$CERT_FILE"
fi

# Gera manifest do projeto
echo "Gerando manifest do projeto..."
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
echo "Assinando projeto..."
openssl dgst -sha512 -sign "$PRIVATE_KEY" -passin pass:"$PASSWORD" \
    -out "$SIGNATURE" "$MANIFEST"

# Verifica a assinatura
if openssl dgst -sha512 -verify "$PUBLIC_KEY" \
    -signature "$SIGNATURE" "$MANIFEST" > /dev/null 2>&1; then
    echo "✅ Projeto assinado com sucesso!"
    echo "📜 Assinatura: $SIGNATURE"
    echo "📋 Manifest: $MANIFEST"
    echo "🔒 Certificado: $CERT_FILE"
    echo "📅 Validade: 10 anos"
else
    echo "❌ ERRO: Falha na verificação da assinatura!"
    exit 1
fi 