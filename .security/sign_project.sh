#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verifica se a senha foi fornecida via variável de ambiente
if [ -z "$YIELDSWAP_PASSWORD" ]; then
    echo -e "${RED}❌ ERRO: Senha não fornecida via YIELDSWAP_PASSWORD${NC}"
    exit 1
fi

# Diretório de segurança
SECURITY_DIR=".security"
mkdir -p "$SECURITY_DIR"

# Gera chave privada RSA-4096 se não existir
if [ ! -f "$SECURITY_DIR/private.key" ]; then
    openssl genpkey -algorithm RSA -out "$SECURITY_DIR/private.key" -pkeyopt rsa_keygen_bits:4096
    chmod 600 "$SECURITY_DIR/private.key"
fi

# Gera chave pública se não existir
if [ ! -f "$SECURITY_DIR/public.key" ]; then
    openssl rsa -pubout -in "$SECURITY_DIR/private.key" -out "$SECURITY_DIR/public.key"
fi

# Gera certificado X.509 se não existir
if [ ! -f "$SECURITY_DIR/certificate.pem" ]; then
    openssl req -new -x509 -key "$SECURITY_DIR/private.key" -out "$SECURITY_DIR/certificate.pem" \
        -days 3650 -subj "/CN=Jistriane Brunielli Silva de Oliveira/O=YieldSwap Project" \
        -addext "keyUsage=digitalSignature,keyEncipherment" \
        -addext "extendedKeyUsage=codeSigning"
fi

# Gera manifest com hashes dos arquivos
echo -e "${YELLOW}[YieldSwap] Gerando manifest do projeto...${NC}"

manifest_file="$SECURITY_DIR/manifest.json"
echo "{" > "$manifest_file"
echo "  \"author\": \"Jistriane Brunielli Silva de Oliveira\"," >> "$manifest_file"
echo "  \"project\": \"YieldSwap\"," >> "$manifest_file"
echo "  \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"," >> "$manifest_file"
echo "  \"validity\": \"10 years\"," >> "$manifest_file"
echo "  \"certificate_fingerprint\": \"$(openssl x509 -fingerprint -sha512 -noout -in $SECURITY_DIR/certificate.pem | cut -d= -f2)\"," >> "$manifest_file"
echo "  \"files\": {" >> "$manifest_file"

# Gera hashes SHA-512 de todos os arquivos relevantes
first=true
find . -type f \
    ! -path "./.git/*" \
    ! -path "./node_modules/*" \
    ! -path "./.security/manifest.json" \
    ! -path "./.security/signature.sha512" \
    -print0 | while IFS= read -r -d '' file; do
    
    if [ "$first" = true ]; then
        first=false
    else
        echo "," >> "$manifest_file"
    fi
    
    hash=$(openssl dgst -sha512 "$file" | cut -d" " -f2)
    echo -n "    \"${file:2}\": \"$hash\"" >> "$manifest_file"
done

echo -e "\n  }\n}" >> "$manifest_file"

# Assina o manifest
echo -e "${YELLOW}[YieldSwap] Assinando projeto...${NC}"
echo -n "$YIELDSWAP_PASSWORD" | openssl dgst -sha512 -sign "$SECURITY_DIR/private.key" -passin stdin -out "$SECURITY_DIR/signature.sha512" "$manifest_file"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[✓] Projeto assinado com sucesso!${NC}"
    echo -e "${GREEN}[✓] 📜 Assinatura: $SECURITY_DIR/signature.sha512${NC}"
    echo -e "${GREEN}[✓] 📋 Manifest: $SECURITY_DIR/manifest.json${NC}"
    echo -e "${GREEN}[✓] 🔒 Certificado: $SECURITY_DIR/certificate.pem${NC}"
    echo -e "${GREEN}[✓] 📅 Validade: 10 anos${NC}"
    echo -e "${GREEN}✅ Projeto assinado com sucesso. Continuando com o push...${NC}"
    exit 0
else
    echo -e "${RED}❌ ERRO: Falha na assinatura do projeto!${NC}"
    exit 1
fi 