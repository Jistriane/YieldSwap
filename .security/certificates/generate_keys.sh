#!/bin/bash
set -e

# Diretórios e arquivos
CERT_DIR=".security/certificates"
PRIVATE_KEY="$CERT_DIR/private.key"
PUBLIC_KEY="$CERT_DIR/public.key"
CERT_FILE="$CERT_DIR/certificate.pem"
CONFIG_FILE="$CERT_DIR/config.cnf"

# Verifica se já existe
if [ -f "$PRIVATE_KEY" ] || [ -f "$PUBLIC_KEY" ] || [ -f "$CERT_FILE" ]; then
    echo "ERRO: Arquivos de certificado já existem. Por favor, remova-os primeiro."
    exit 1
fi

# Solicita senha forte
echo "Digite uma senha forte para proteger sua chave privada (mínimo 12 caracteres):"
read -s PASSWORD
echo

if [ ${#PASSWORD} -lt 12 ]; then
    echo "ERRO: A senha deve ter pelo menos 12 caracteres"
    exit 1
fi

# Gera par de chaves RSA-4096 protegido por senha
openssl genpkey -algorithm RSA -aes256 -pass pass:"$PASSWORD" \
    -pkeyopt rsa_keygen_bits:4096 -out "$PRIVATE_KEY"

# Extrai chave pública
openssl rsa -pubout -in "$PRIVATE_KEY" -passin pass:"$PASSWORD" -out "$PUBLIC_KEY"

# Gera certificado auto-assinado válido por 10 anos
openssl req -x509 -new -nodes -key "$PRIVATE_KEY" -passin pass:"$PASSWORD" \
    -sha512 -days 3650 -config "$CONFIG_FILE" -out "$CERT_FILE"

# Configura permissões
chmod 600 "$PRIVATE_KEY"
chmod 644 "$PUBLIC_KEY" "$CERT_FILE"

# Gera hash do certificado
CERT_HASH=$(openssl x509 -noout -hash -in "$CERT_FILE")

echo "Geração de certificado concluída com sucesso!"
echo "Hash do Certificado: $CERT_HASH"
echo
echo "IMPORTANTE: Guarde sua senha em local seguro!"
echo "Este certificado é válido por 10 anos e não pode ser removido sem a senha." 