# 🔐 YieldSwap - Digital Signature

This project is protected by a cryptographic digital signature.

## 📜 Signature Details

- **✍️ Author**: Jistriane Brunielli Silva de Oliveira
- **📅 Validity**: 10 years
- **🔒 Method**: RSA-4096 + SHA-512
- **📋 Certificate**: X.509 Self-Signed
- **⚡ Status**: Active and Verified

## 🛡️ Implemented Protection

- **✅ Digital Signature**: `.security/signature.sha512`
- **📊 Manifest**: `.security/manifest.json`
- **🔑 Certificate**: `.security/certificate.pem`
- **🔏 Public Key**: `.security/public.key`

## 🔍 Verification

The integrity of this project can be verified using:

```bash
# Verify signature
openssl dgst -sha512 -verify .security/public.key -signature .security/signature.sha512 .security/manifest.json

# Verify certificate
openssl x509 -in .security/certificate.pem -text -noout
```

## ⚠️ Legal Notice

This project is protected by copyright and cryptographic signature. Any unauthorized attempt to modify or remove the signature is strictly prohibited.

---

**🔒 Digitally signed by Jistriane Brunielli Silva de Oliveira**  
**📅 Last signature date: July 26, 2025** 