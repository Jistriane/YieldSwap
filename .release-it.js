/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


module.exports = {
  git: {
    commitMessage: 'chore: release v${version}',
    tagName: 'v${version}',
    tagAnnotation: 'Release v${version}',
    push: true,
  },
  github: {
    release: true,
    releaseName: 'Release ${version}',
  },
  npm: {
    publish: false,
  },
  plugins: {
    '@release-it/conventional-changelog': {
      preset: 'angular',
      infile: 'CHANGELOG.md',
    },
  },
}; 