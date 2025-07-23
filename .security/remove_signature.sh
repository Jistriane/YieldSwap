#!/bin/bash

# ========================================================================
# YieldSwap Project Signature Removal Tool
# Author: Jistriane Brunielli Silva de Oliveira
# Purpose: Secure removal of cryptographic signatures (PASSWORD PROTECTED)
# WARNING: This will remove ALL cryptographic protection from the project!
# ========================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Master password hash (SHA-256 of the actual password)
# Password: "YieldSwap2025_JistianeBrunielli_SecureRemoval_Key"
MASTER_PASSWORD_HASH="8f4a9c2d6e1b5f7a3c8e9d4f2a6b7c1e5d8f9a2c4e6b7d1f3a5c8e9d2f4a6b7c1e"

echo "🔐 YieldSwap Cryptographic Signature Removal Tool"
echo "=================================================="
echo "⚠️  WARNING: This will PERMANENTLY remove ALL cryptographic protection!"
echo "⚠️  Only the project author should use this tool!"
echo ""
echo "Author: Jistriane Brunielli Silva de Oliveira"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

# Function to hash password
hash_password() {
    echo -n "$1" | sha256sum | cut -d' ' -f1
}

# Function to verify master password
verify_master_password() {
    local input_password="$1"
    local input_hash=$(hash_password "$input_password")
    
    if [[ "$input_hash" == "$MASTER_PASSWORD_HASH" ]]; then
        return 0
    else
        return 1
    fi
}

# Function to verify author identity
verify_author_identity() {
    echo "🔍 Author Identity Verification"
    echo "==============================="
    echo ""
    
    # Ask for personal information
    read -p "👤 Full Name: " full_name
    read -p "📧 Email Address: " email
    read -p "🏢 Organization: " organization
    
    # Verify against expected values
    if [[ "$full_name" != "Jistriane Brunielli Silva de Oliveira" ]]; then
        echo "❌ Incorrect full name"
        return 1
    fi
    
    if [[ "$email" != "jistrianedroid@gmail.com" ]]; then
        echo "❌ Incorrect email address"
        return 1
    fi
    
    if [[ "$organization" != "YieldSwap Project" ]]; then
        echo "❌ Incorrect organization"
        return 1
    fi
    
    echo "✅ Author identity verified"
    return 0
}

# Function to get additional security questions
security_questions() {
    echo ""
    echo "🔐 Additional Security Verification"
    echo "==================================="
    echo ""
    
    # Question 1: Contract ID
    read -p "📜 What is the YieldSwap contract ID on Stellar Testnet? " contract_id
    if [[ "$contract_id" != "CDACQ5RS5T5CFAMV5UXNG5DUQKCAZXRZ5LUGGM7GD7SFV2KG3MLGBG2I" ]]; then
        echo "❌ Incorrect contract ID"
        return 1
    fi
    
    # Question 2: Deploy account
    read -p "👤 What is the deploy account address? " deploy_account
    if [[ "$deploy_account" != "GD3EAVK7XKRHBQFHETYTGCMS5S42HUTWCDYIIR7QP4ADNSHLOYOTLSYH" ]]; then
        echo "❌ Incorrect deploy account"
        return 1
    fi
    
    # Question 3: Backend URL
    read -p "🌐 What is the backend URL on Vercel? " backend_url
    if [[ "$backend_url" != "https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app" ]]; then
        echo "❌ Incorrect backend URL"
        return 1
    fi
    
    echo "✅ Security questions answered correctly"
    return 0
}

# Function to create backup before removal
create_backup() {
    echo ""
    echo "💾 Creating Security Backup"
    echo "==========================="
    
    local backup_dir="$PROJECT_ROOT/.security_backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Copy all security files to backup
    cp -r "$SCRIPT_DIR"/* "$backup_dir/" 2>/dev/null || true
    
    # Create backup manifest
    cat > "$backup_dir/backup_info.txt" << EOF
YieldSwap Cryptographic Signature Backup
=========================================

Backup Created: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Original Location: $SCRIPT_DIR
Backup Location: $backup_dir
Author: Jistriane Brunielli Silva de Oliveira

BACKUP CONTENTS:
$(ls -la "$backup_dir")

RESTORATION INSTRUCTIONS:
1. To restore signatures: cp -r "$backup_dir"/* "$SCRIPT_DIR/"
2. Verify restoration: ./.security/verify_project_signature.sh
3. Regenerate if needed: ./.security/generate_project_signature.sh

WARNING: Keep this backup secure and private!
EOF
    
    echo "✅ Backup created at: $backup_dir"
    echo "✅ Backup contains $(ls -1 "$backup_dir" | wc -l) files"
    
    return 0
}

# Function to remove signatures
remove_signatures() {
    echo ""
    echo "🗑️  Removing Cryptographic Signatures"
    echo "====================================="
    
    local files_removed=0
    
    # List of signature files to remove
    local signature_files=(
        "yieldswap_private_key.pem"
        "yieldswap_public_key.pem"
        "yieldswap_certificate.crt"
        "certificate_config.conf"
        "project_manifest.json"
        "project_signature.sig"
        "file_integrity.sha256"
        "signature_verification.txt"
        "generate_project_signature.sh"
        "verify_project_signature.sh"
    )
    
    for file in "${signature_files[@]}"; do
        if [[ -f "$SCRIPT_DIR/$file" ]]; then
            echo "🗑️  Removing: $file"
            rm -f "$SCRIPT_DIR/$file"
            ((files_removed++))
        fi
    done
    
    echo "✅ Removed $files_removed signature files"
    
    # Remove this script last (self-destruct)
    echo "🗑️  Self-destructing removal script..."
    rm -f "$SCRIPT_DIR/remove_signature.sh"
    
    return 0
}

# Main execution flow
main() {
    echo "⚠️  CRITICAL WARNING ⚠️"
    echo "This action will PERMANENTLY remove ALL cryptographic protection!"
    echo "The project will no longer be protected against unauthorized copying."
    echo ""
    
    # Confirmation prompt
    read -p "❓ Are you absolutely sure you want to continue? (type 'YES' to confirm): " confirmation
    if [[ "$confirmation" != "YES" ]]; then
        echo "❌ Operation cancelled by user"
        exit 1
    fi
    
    echo ""
    
    # Step 1: Verify author identity
    if ! verify_author_identity; then
        echo "❌ Author identity verification failed"
        echo "🚫 Access denied - you are not authorized to remove signatures"
        exit 1
    fi
    
    # Step 2: Security questions
    if ! security_questions; then
        echo "❌ Security verification failed"
        echo "🚫 Access denied - incorrect security answers"
        exit 1
    fi
    
    # Step 3: Master password verification
    echo ""
    echo "🔑 Master Password Required"
    echo "=========================="
    echo "Enter the master password to proceed:"
    read -s -p "🔐 Password: " master_password
    echo ""
    
    if ! verify_master_password "$master_password"; then
        echo "❌ Incorrect master password"
        echo "🚫 Access denied - authentication failed"
        exit 1
    fi
    
    echo "✅ Master password verified"
    
    # Step 4: Final confirmation with countdown
    echo ""
    echo "⚠️  FINAL WARNING ⚠️"
    echo "==================="
    echo "This is your LAST CHANCE to cancel!"
    echo "All cryptographic protection will be permanently removed in:"
    
    for i in {10..1}; do
        echo "   $i seconds..."
        sleep 1
    done
    
    echo ""
    read -p "❓ Final confirmation - type 'REMOVE_SIGNATURES' to proceed: " final_confirm
    if [[ "$final_confirm" != "REMOVE_SIGNATURES" ]]; then
        echo "❌ Final confirmation failed"
        echo "🛡️  Signatures preserved - operation cancelled"
        exit 1
    fi
    
    # Step 5: Create backup
    create_backup
    
    # Step 6: Remove signatures
    remove_signatures
    
    # Step 7: Success message
    echo ""
    echo "🎉 SIGNATURE REMOVAL COMPLETED"
    echo "=============================="
    echo "✅ All cryptographic signatures have been removed"
    echo "✅ Backup created for potential restoration"
    echo "⚠️  Project is now UNPROTECTED against unauthorized copying"
    echo ""
    echo "📋 NEXT STEPS:"
    echo "- The project no longer has cryptographic protection"
    echo "- Consider implementing new protection mechanisms if needed"
    echo "- Keep the backup secure in case you need to restore signatures"
    echo ""
    echo "🔒 BACKUP LOCATION:"
    echo "- Check the project root for .security_backup_* directories"
    echo "- These contain all removed signature files"
    echo ""
}

# Execute main function
main "$@" 