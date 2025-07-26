<!--
🔐 ARQUIVO ASSINADO DIGITALMENTE

✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
📅 Validade: 10 anos (até 2035)
🔒 Método: RSA-4096 + SHA-512
📜 Verificação: SIGNATURE.md
⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
-->


# 🔐 YieldSwap - Assinatura Digital

Este projeto está protegido por uma assinatura digital criptográfica.

## 📜 Detalhes da Assinatura

- **✍️ Autor**: Jistriane Brunielli Silva de Oliveira
- **📅 Validade**: 10 anos
- **🔒 Método**: RSA-4096 + SHA-512
- **📋 Certificado**: X.509 Self-Signed
- **⚡ Status**: Ativo e Verificado

## 🛡️ Proteção Implementada

- **✅ Assinatura Digital**: `.security/signature.sha512`
- **📊 Manifest**: `.security/manifest.json`
- **🔑 Certificado**: `.security/certificate.pem`
- **🔏 Chave Pública**: `.security/public.key`

## 🔍 Verificação

A integridade deste projeto pode ser verificada usando:

```bash
# Verificar assinatura
openssl dgst -sha512 -verify .security/public.key -signature .security/signature.sha512 .security/manifest.json

# Verificar certificado
openssl x509 -in .security/certificate.pem -text -noout
```

## ⚠️ Aviso Legal

Este projeto está protegido por direitos autorais e assinatura criptográfica. Qualquer tentativa de modificação não autorizada ou remoção da assinatura é estritamente proibida.

---

**🔒 Assinado digitalmente por Jistriane Brunielli Silva de Oliveira**  
**📅 Data da última assinatura: 26 de Julho de 2025** 