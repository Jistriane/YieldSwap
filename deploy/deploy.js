/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


const fs = require('fs');
const StellarSdk = require('stellar-sdk');

// Configuração da rede
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
StellarSdk.Network.useTestNetwork();

// Endereço da carteira
const publicKey = 'GALGAC3V44PCOQJG6AVU5MJNA3UTMJNMYMF3DTGMTZ2VQVPUBXZWREX7';

async function deployContract() {
    try {
        // Ler o arquivo WASM em base64
        const wasmBase64 = fs.readFileSync('./deploy/contract.base64', 'utf8');
        
        // Carregar a conta
        const account = await server.loadAccount(publicKey);
        
        // Criar a transação
        const fee = await server.fetchBaseFee();
        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee,
            networkPassphrase: StellarSdk.Networks.TESTNET
        })
        .addOperation(StellarSdk.Operation.deployContract({
            wasm: Buffer.from(wasmBase64, 'base64')
        }))
        .setTimeout(30)
        .build();

        // Gerar o XDR
        const xdr = transaction.toXDR();
        console.log('\nXDR da transação (use no Freighter):\n');
        console.log(xdr);
        
        // Salvar o XDR em um arquivo
        fs.writeFileSync('./deploy/transaction.xdr', xdr);
        console.log('\nXDR salvo em deploy/transaction.xdr');
        
    } catch (error) {
        console.error('Erro:', error);
    }
}

deployContract(); 