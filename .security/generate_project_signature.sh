#!/bin/bash
set -e

# Caminhos
MANIFEST=".security/project_manifest.json"
HASHES=".security/file_integrity.sha256"
PRIVATE_KEY=".security/private.pem"
SIGNATURE=".security/project_signature.sig"

# Solicita senha master
read -s -p "Enter master password: " MASTER_PWD
echo

# Verifica senha (ajuste a senha abaixo para a sua senha master real)
MASTER_HASH="$(echo -n "YieldSwap2025_JistianeBrunielli_SecureRemoval_Key" | sha256sum | awk '{print $1}')"
USER_HASH="$(echo -n "$MASTER_PWD" | sha256sum | awk '{print $1}')"
if [[ "$USER_HASH" != "$MASTER_HASH" ]]; then
  echo "[YieldSwap] Incorrect master password. Aborting signature."
  exit 1
fi

# Gera hashes SHA-256 de todos os arquivos relevantes
find . \
  -type f \
  ! -path "./.git/*" \
  ! -path "./.security/private.pem" \
  ! -path "./node_modules/*" \
  ! -path "./.security/project_signature.sig" \
  ! -path "./.security/file_integrity.sha256" \
  ! -path "./.security/project_manifest.json" \
  ! -path "./.security/generate_project_signature.sh" \
  ! -path "./.security/verify_project_signature.sh" \
  -exec sha256sum {} \; | sort > "$HASHES"

# Gera manifesto JSON simples
{
  echo '{'
  echo '  "project": "YieldSwap",'
  echo '  "signed_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",'
  echo '  "hashes_file": "file_integrity.sha256"'
  echo '}'
} > "$MANIFEST"

# Assina o arquivo de hashes
openssl dgst -sha256 -sign "$PRIVATE_KEY" -out "$SIGNATURE" "$HASHES"

chmod 600 "$SIGNATURE"
echo "[YieldSwap] Project signed successfully! Signature saved to $SIGNATURE." 