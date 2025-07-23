#!/bin/bash

# ========================================================================
# YieldSwap Project Cryptographic Signature Generator
# Author: Jistriane Brunielli Silva de Oliveira
# Purpose: Generate cryptographic signatures to protect project integrity
# Validity: 10 years (until 2035-07-21)
# ========================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SIGNATURE_DIR="$SCRIPT_DIR"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "🔐 YieldSwap Cryptographic Signature Generator"
echo "================================================"
echo "Author: Jistriane Brunielli Silva de Oliveira"
echo "Timestamp: $TIMESTAMP"
echo "Project Root: $PROJECT_ROOT"
echo ""

# Create signature manifest
MANIFEST_FILE="$SIGNATURE_DIR/project_manifest.json"
SIGNATURE_FILE="$SIGNATURE_DIR/project_signature.sig"
INTEGRITY_FILE="$SIGNATURE_DIR/file_integrity.sha256"

echo "📁 Generating file integrity hashes..."

# Generate SHA-256 hashes for all important files
cd "$PROJECT_ROOT"
find . -type f \( \
    -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \
    -o -name "*.rs" -o -name "*.toml" -o -name "*.json" -o -name "*.md" \
    -o -name "*.yml" -o -name "*.yaml" -o -name "*.lock" \
    -o -name "Makefile" -o -name "Dockerfile" -o -name "*.sh" \
\) \
    ! -path "./.git/*" \
    ! -path "./node_modules/*" \
    ! -path "./.next/*" \
    ! -path "./.turbo/*" \
    ! -path "./target/*" \
    ! -path "./.security/*" \
    | sort | xargs sha256sum > "$INTEGRITY_FILE"

echo "✅ Generated $(wc -l < "$INTEGRITY_FILE") file hashes"

# Create project manifest with metadata
cat > "$MANIFEST_FILE" << EOF
{
  "project": {
    "name": "YieldSwap",
    "description": "Revolutionary DeFi Platform: Swap + Yield Farming in a single transaction",
    "author": "Jistriane Brunielli Silva de Oliveira",
    "email": "jistrianedroid@gmail.com",
    "version": "1.0.0",
    "license": "MIT",
    "repository": "https://github.com/yieldswap/yieldswap"
  },
  "signature": {
    "generated_at": "$TIMESTAMP",
    "expires_at": "2035-07-21T20:49:29Z",
    "algorithm": "RSA-4096 + SHA-256",
    "certificate": "yieldswap_certificate.crt",
    "public_key": "yieldswap_public_key.pem"
  },
  "protection": {
    "copyright": "© 2025 Jistriane Brunielli Silva de Oliveira. All rights reserved.",
    "warning": "This project is protected by cryptographic signatures. Unauthorized copying, distribution, or modification may violate intellectual property rights.",
    "verification": "Use 'verify_project_signature.sh' to validate authenticity"
  },
  "blockchain": {
    "network": "Stellar Testnet",
    "contract_id": "CDACQ5RS5T5CFAMV5UXNG5DUQKCAZXRZ5LUGGM7GD7SFV2KG3MLGBG2I",
    "deploy_account": "GD3EAVK7XKRHBQFHETYTGCMS5S42HUTWCDYIIR7QP4ADNSHLOYOTLSYH",
    "transaction_hash": "d27541f3e9abd0c52bea08c21ba4249442e1ca1a4c816ed183934c5d4ad3ca23"
  },
  "deployment": {
    "backend_url": "https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app",
    "api_docs": "https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/docs",
    "health_check": "https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/health"
  },
  "statistics": {
    "total_files": $(wc -l < "$INTEGRITY_FILE"),
    "total_lines": $(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.rs" \) ! -path "./.git/*" ! -path "./node_modules/*" ! -path "./.next/*" ! -path "./target/*" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0"),
    "signature_strength": "4096-bit RSA",
    "hash_algorithm": "SHA-256"
  }
}
EOF

echo "📄 Generated project manifest"

# Sign the manifest with private key
echo "🔐 Signing project manifest..."
openssl dgst -sha256 -sign "$SIGNATURE_DIR/yieldswap_private_key.pem" \
    -out "$SIGNATURE_FILE" "$MANIFEST_FILE"

echo "✅ Generated cryptographic signature"

# Create verification summary
VERIFICATION_FILE="$SIGNATURE_DIR/signature_verification.txt"
cat > "$VERIFICATION_FILE" << EOF
========================================================================
YIELDSWAP PROJECT CRYPTOGRAPHIC SIGNATURE VERIFICATION
========================================================================

Project: YieldSwap - Revolutionary DeFi Platform
Author: Jistriane Brunielli Silva de Oliveira
Email: jistrianedroid@gmail.com
Generated: $TIMESTAMP
Expires: 2035-07-21T20:49:29Z (10 years validity)

CERTIFICATE INFORMATION:
------------------------
Subject: CN=Jistriane Brunielli Silva de Oliveira, OU=Blockchain Development, O=YieldSwap Project, L=Brazil, ST=Brazil, C=BR
Issuer: Self-signed certificate
Valid From: $(openssl x509 -in "$SIGNATURE_DIR/yieldswap_certificate.crt" -noout -startdate | cut -d= -f2)
Valid Until: $(openssl x509 -in "$SIGNATURE_DIR/yieldswap_certificate.crt" -noout -enddate | cut -d= -f2)
Serial Number: $(openssl x509 -in "$SIGNATURE_DIR/yieldswap_certificate.crt" -noout -serial | cut -d= -f2)

SIGNATURE DETAILS:
------------------
Algorithm: RSA-4096 with SHA-256
Key Size: 4096 bits
Signature File: project_signature.sig
Manifest File: project_manifest.json
Integrity File: file_integrity.sha256

PROJECT STATISTICS:
-------------------
Total Files Protected: $(wc -l < "$INTEGRITY_FILE")
Certificate Fingerprint: $(openssl x509 -in "$SIGNATURE_DIR/yieldswap_certificate.crt" -noout -fingerprint -sha256 | cut -d= -f2)

BLOCKCHAIN DEPLOYMENT:
----------------------
Network: Stellar Testnet
Contract ID: CDACQ5RS5T5CFAMV5UXNG5DUQKCAZXRZ5LUGGM7GD7SFV2KG3MLGBG2I
Deploy Account: GD3EAVK7XKRHBQFHETYTGCMS5S42HUTWCDYIIR7QP4ADNSHLOYOTLSYH
Transaction: d27541f3e9abd0c52bea08c21ba4249442e1ca1a4c816ed183934c5d4ad3ca23

API ENDPOINTS:
--------------
Backend: https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app
Documentation: https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/docs
Health Check: https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/health

VERIFICATION COMMANDS:
----------------------
1. Verify signature: openssl dgst -sha256 -verify yieldswap_public_key.pem -signature project_signature.sig project_manifest.json
2. Check certificate: openssl x509 -in yieldswap_certificate.crt -text -noout
3. Verify file integrity: sha256sum -c file_integrity.sha256
4. Run verification script: ./verify_project_signature.sh

COPYRIGHT NOTICE:
-----------------
© 2025 Jistriane Brunielli Silva de Oliveira. All rights reserved.

This project is protected by cryptographic signatures and intellectual
property rights. Unauthorized copying, distribution, or modification
may violate applicable laws.

For licensing inquiries, contact: jistrianedroid@gmail.com

========================================================================
EOF

echo "📋 Generated verification summary"

# Display results
echo ""
echo "🎉 SIGNATURE GENERATION COMPLETED SUCCESSFULLY!"
echo "================================================"
echo "✅ Private Key: yieldswap_private_key.pem (KEEP SECURE)"
echo "✅ Public Key: yieldswap_public_key.pem"
echo "✅ Certificate: yieldswap_certificate.crt (Valid until 2035-07-21)"
echo "✅ Project Manifest: project_manifest.json"
echo "✅ Cryptographic Signature: project_signature.sig"
echo "✅ File Integrity Hashes: file_integrity.sha256 ($(wc -l < "$INTEGRITY_FILE") files)"
echo "✅ Verification Summary: signature_verification.txt"
echo ""
echo "🔐 SECURITY NOTICE:"
echo "- Keep yieldswap_private_key.pem SECURE and PRIVATE"
echo "- Share yieldswap_public_key.pem for signature verification"
echo "- Certificate is valid for 10 years (until 2035-07-21)"
echo "- Use verify_project_signature.sh to validate authenticity"
echo ""
echo "📊 PROJECT PROTECTION STATISTICS:"
echo "- Files Protected: $(wc -l < "$INTEGRITY_FILE")"
echo "- Signature Strength: 4096-bit RSA"
echo "- Hash Algorithm: SHA-256"
echo "- Certificate Serial: $(openssl x509 -in "$SIGNATURE_DIR/yieldswap_certificate.crt" -noout -serial | cut -d= -f2)"
echo "" 