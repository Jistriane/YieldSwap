#!/bin/bash
set -e

# Configurações
CERT_DIR=".security/certificates"
PRIVATE_KEY="$CERT_DIR/private.key"
MANIFEST="$CERT_DIR/manifest.json"
SIGNATURE="$CERT_DIR/signature.sha512"

# Verifica certificado
if [ ! -f "$PRIVATE_KEY" ]; then
    echo "ERRO: Certificado não encontrado. Execute generate_keys.sh primeiro."
    exit 1
fi

# Solicita senha
echo "Digite sua senha de assinatura:"
read -s PASSWORD
echo

# Gera manifest do projeto
echo "Gerando manifest do projeto..."
{
    echo '{'
    echo '  "project": "YieldSwap",'
    echo '  "author": "Jistriane Brunielli Silva de Oliveira",'
    echo '  "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",'
    echo '  "files": ['
    
    # Lista todos os arquivos (exceto .git e node_modules)
    find . -type f \
        ! -path "./.git/*" \
        ! -path "./node_modules/*" \
        ! -path "./.security/certificates/*" \
        -exec sha512sum {} \; | while read -r hash file; do
        echo "    {"
        echo "      \"path\": \"${file:2}\","
        echo "      \"sha512\": \"$hash\""
        echo "    },"
    done | sed '$ s/,$//'
    
    echo '  ]'
    echo '}'
} > "$MANIFEST"

# Assina o manifest
echo "Assinando projeto..."
openssl dgst -sha512 -sign "$PRIVATE_KEY" -passin pass:"$PASSWORD" \
    -out "$SIGNATURE" "$MANIFEST"

# Verifica a assinatura
if openssl dgst -sha512 -verify "$CERT_DIR/public.key" \
    -signature "$SIGNATURE" "$MANIFEST" > /dev/null 2>&1; then
    echo "Projeto assinado com sucesso!"
    echo "Assinatura salva em: $SIGNATURE"
    echo "Manifest salvo em: $MANIFEST"
else
    echo "ERRO: Falha na verificação da assinatura!"
    exit 1
fi 