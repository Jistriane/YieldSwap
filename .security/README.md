# 🔐 YieldSwap Cryptographic Security System

## 📋 Visão Geral

Este diretório contém o sistema completo de proteção criptográfica do projeto YieldSwap, desenvolvido por **Jistriane Brunielli Silva de Oliveira**. O sistema implementa múltiplas camadas de segurança para proteger contra cópia não autorizada e garantir a autenticidade do projeto.

## 🛡️ Componentes de Segurança

### 📜 Certificados e Chaves

| Arquivo | Propósito | Segurança |
|---------|-----------|-----------|
| `yieldswap_private_key.pem` | Chave privada RSA-4096 | 🔴 **CRÍTICO - MANTER SEGURO** |
| `yieldswap_public_key.pem` | Chave pública para verificação | 🟢 Pode ser compartilhada |
| `yieldswap_certificate.crt` | Certificado digital auto-assinado | 🟢 Pode ser compartilhada |
| `certificate_config.conf` | Configuração do certificado | 🟡 Informações do autor |

### 📊 Arquivos de Integridade

| Arquivo | Propósito | Conteúdo |
|---------|-----------|----------|
| `project_manifest.json` | Metadados do projeto | Informações completas do YieldSwap |
| `project_signature.sig` | Assinatura digital | Assinatura criptográfica do manifest |
| `file_integrity.sha256` | Hashes dos arquivos | SHA-256 de 1216+ arquivos do projeto |
| `signature_verification.txt` | Resumo de verificação | Informações para validação |

### 🔧 Scripts de Automação

| Script | Funcionalidade | Uso |
|--------|----------------|-----|
| `generate_project_signature.sh` | Gera todas as assinaturas | `./generate_project_signature.sh` |
| `verify_project_signature.sh` | Verifica autenticidade | `./verify_project_signature.sh` |
| `remove_signature.sh` | Remove proteções (protegido por senha) | `./remove_signature.sh` |

## 🔐 Sistema de Proteção por Senha

### 🗝️ Senha Master
- **Algoritmo**: SHA-256
- **Proteção**: Múltiplas camadas de verificação
- **Acesso**: Apenas o autor autorizado

### 🔍 Verificações de Segurança

1. **Identidade do Autor**:
   - Nome completo: Jistriane Brunielli Silva de Oliveira
   - Email: jistrianedroid@gmail.com
   - Organização: YieldSwap Project

2. **Perguntas de Segurança**:
   - Contract ID do Stellar Testnet
   - Endereço da conta de deploy
   - URL do backend na Vercel

3. **Senha Master**:
   - Hash SHA-256 pré-calculado
   - Verificação criptográfica
   - Tentativas limitadas

## 📈 Estatísticas de Proteção

```
🔐 PROTEÇÃO ATIVA:
- Arquivos Protegidos: 1216+
- Algoritmo: RSA-4096 + SHA-256
- Validade: 10 anos (até 2035-07-21)
- Força da Chave: 4096 bits
- Hash Algorithm: SHA-256

📊 COBERTURA:
- Código TypeScript/JavaScript: ✅
- Contratos Rust/Soroban: ✅
- Configurações JSON/YAML: ✅
- Documentação Markdown: ✅
- Scripts de Build/Deploy: ✅
```

## 🚀 Como Usar

### ✅ Verificar Autenticidade

```bash
# Verificação completa
./.security/verify_project_signature.sh

# Verificação manual da assinatura
openssl dgst -sha256 -verify .security/yieldswap_public_key.pem \
  -signature .security/project_signature.sig \
  .security/project_manifest.json

# Verificar certificado
openssl x509 -in .security/yieldswap_certificate.crt -text -noout

# Verificar integridade dos arquivos
sha256sum -c .security/file_integrity.sha256
```

### 🔄 Regenerar Assinaturas

```bash
# Gerar novas assinaturas (sobrescreve as existentes)
./.security/generate_project_signature.sh
```

### 🗑️ Remover Proteção (Protegido por Senha)

```bash
# ATENÇÃO: Remove TODA a proteção criptográfica
./.security/remove_signature.sh
```

## 🔍 Informações do Certificado

```
Subject: CN=Jistriane Brunielli Silva de Oliveira, 
         OU=Blockchain Development, 
         O=YieldSwap Project, 
         L=Brazil, ST=Brazil, C=BR

Issuer: Self-signed certificate
Valid From: Jul 23 20:49:29 2025 GMT
Valid Until: Jul 21 20:49:29 2035 GMT
Serial Number: 20EC1363A6723676137A5DC004A8FFA4B7E16AB7
Key Size: 4096 bits RSA
Signature Algorithm: sha256WithRSAEncryption
```

## 🔗 Integração com Blockchain

### 📜 Informações do Contrato Stellar

```
Network: Stellar Testnet
Contract ID: CDACQ5RS5T5CFAMV5UXNG5DUQKCAZXRZ5LUGGM7GD7SFV2KG3MLGBG2I
Deploy Account: GD3EAVK7XKRHBQFHETYTGCMS5S42HUTWCDYIIR7QP4ADNSHLOYOTLSYH
Transaction Hash: d27541f3e9abd0c52bea08c21ba4249442e1ca1a4c816ed183934c5d4ad3ca23

Explorer Links:
- Contract: https://stellar.expert/explorer/testnet/contract/CDACQ...BG2I
- Account: https://stellar.expert/explorer/testnet/account/GD3EA...SYH
- Transaction: https://stellar.expert/explorer/testnet/tx/d2754...ca23
```

### 🌐 Endpoints de Produção

```
Backend API: https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app
Documentation: https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/docs
Health Check: https://yieldswap-stellar-mb55syqz9-jistrianes-projects.vercel.app/health
```

## ⚠️ Avisos de Segurança

### 🔴 CRÍTICO
- **NUNCA** compartilhe o arquivo `yieldswap_private_key.pem`
- **NUNCA** faça commit da chave privada no repositório
- **SEMPRE** mantenha backups seguros das chaves

### 🟡 IMPORTANTE
- Verifique sempre a autenticidade antes de usar o projeto
- Qualquer modificação nos arquivos invalidará as assinaturas
- O sistema detecta automaticamente alterações não autorizadas

### 🟢 RECOMENDAÇÕES
- Execute `verify_project_signature.sh` periodicamente
- Mantenha os scripts de verificação junto com o projeto
- Documente qualquer processo de verificação customizado

## 📞 Suporte e Contato

**Autor**: Jistriane Brunielli Silva de Oliveira  
**Email**: jistrianedroid@gmail.com  
**Projeto**: YieldSwap - Revolutionary DeFi Platform  
**GitHub**: https://github.com/yieldswap/yieldswap  

Para questões sobre autenticidade, verificação de assinaturas ou licenciamento, entre em contato diretamente com o autor.

---

## 📄 Licença e Copyright

```
© 2025 Jistriane Brunielli Silva de Oliveira. All rights reserved.

Este projeto é protegido por assinaturas criptográficas e direitos
de propriedade intelectual. Cópia, distribuição ou modificação não
autorizada pode violar leis aplicáveis.

Licença: MIT (com cláusulas de proteção criptográfica)
```

---

*Sistema de segurança implementado em 23 de julho de 2025*  
*Válido até 21 de julho de 2035 (10 anos)* 