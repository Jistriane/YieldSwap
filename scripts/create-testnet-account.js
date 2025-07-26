/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


const StellarSdk = require('stellar-sdk');

// Configurar para usar a Testnet
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
StellarSdk.Network.useTestNetwork();

// Gerar um novo par de chaves
const keypair = StellarSdk.Keypair.random();

console.log('\n🔑 Novo par de chaves Stellar criado:');
console.log('Chave Pública (endereço):', keypair.publicKey());
console.log('Chave Privada (secreta):', keypair.secret());

// Função para solicitar XLM do Friendbot
async function getFriendBotXLM(publicKey) {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${publicKey}`,
      { method: 'POST' }
    );
    
    if (!response.ok) {
      throw new Error('Falha ao solicitar XLM');
    }
    
    console.log('\n✅ 10.000 XLM de teste recebidos com sucesso!');
    console.log('\nVerifique sua conta em:');
    console.log(`https://stellar.expert/explorer/testnet/account/${publicKey}`);
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

// Solicitar XLM do Friendbot
getFriendBotXLM(keypair.publicKey()); 