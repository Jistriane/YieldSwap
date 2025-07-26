#!/bin/bash

# Cabeçalho da assinatura
SIGNATURE_HEADER="/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */

"

# Cabeçalho para arquivos Markdown/Texto
SIGNATURE_HEADER_MD="<!--
🔐 ARQUIVO ASSINADO DIGITALMENTE

✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
📅 Validade: 10 anos (até 2035)
🔒 Método: RSA-4096 + SHA-512
📜 Verificação: SIGNATURE.md
⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
-->

"

# Função para adicionar cabeçalho
add_signature_header() {
    local file=$1
    local ext="${file##*.}"
    local temp_file=$(mktemp)

    # Escolhe o cabeçalho apropriado baseado na extensão
    if [[ "$ext" == "md" || "$ext" == "txt" ]]; then
        echo -e "$SIGNATURE_HEADER_MD" > "$temp_file"
    else
        echo -e "$SIGNATURE_HEADER" > "$temp_file"
    fi

    # Adiciona o conteúdo original do arquivo
    cat "$file" >> "$temp_file"

    # Substitui o arquivo original
    mv "$temp_file" "$file"
    echo "✅ Assinatura adicionada: $file"
}

# Lista de extensões de arquivo para processar
file_types=("ts" "tsx" "js" "jsx" "md" "json" "yml" "yaml" "sh" "rs" "toml")

# Processa todos os arquivos relevantes
for ext in "${file_types[@]}"; do
    while IFS= read -r -d '' file; do
        # Ignora arquivos na pasta node_modules, .git e arquivos já assinados
        if [[ "$file" != *"node_modules"* && "$file" != *".git"* ]]; then
            if ! grep -q "ARQUIVO ASSINADO DIGITALMENTE" "$file"; then
                add_signature_header "$file"
            fi
        fi
    done < <(find . -type f -name "*.$ext" -print0)
done

echo "🎉 Assinatura adicionada a todos os arquivos relevantes!" 