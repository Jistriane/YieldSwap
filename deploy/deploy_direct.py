from stellar_sdk import Server, Keypair, TransactionBuilder, Network, Asset
from stellar_sdk.exceptions import NotFoundError, BadResponseError
import requests
import base64

# Configurações
ACCOUNT_ID = "GAECNF26H5AZCGVZGNFPJMEDKGE55DGNZYLZCPSEEVHLR6J4WVDODRPS"
HORIZON_URL = "https://horizon-testnet.stellar.org"
NETWORK_PASSPHRASE = Network.TESTNET_NETWORK_PASSPHRASE

def read_wasm():
    with open("../target/wasm32-unknown-unknown/release/yield_swap_router.wasm", "rb") as f:
        return f.read()

def deploy_contract():
    try:
        # Configurar servidor
        server = Server(horizon_url=HORIZON_URL)
        
        # Carregar conta
        source_account = server.load_account(ACCOUNT_ID)
        
        # Ler WASM
        wasm_bytes = read_wasm()
        
        # Criar transação
        transaction = (
            TransactionBuilder(
                source_account=source_account,
                network_passphrase=NETWORK_PASSPHRASE,
                base_fee=100000
            )
            .add_text_memo("Deploy YieldSwapRouter")
            .set_timeout(30)
            .build()
        )
        
        # Gerar XDR
        xdr = transaction.to_xdr()
        print("\nXDR da transação (use no Freighter):\n")
        print(xdr)
        
        # Salvar XDR
        with open("transaction.xdr", "w") as f:
            f.write(xdr)
        print("\nXDR salvo em transaction.xdr")
        
        print("\nPara completar o deploy:")
        print("1. Copie o XDR acima")
        print("2. Use o Freighter para assinar")
        print("3. Submeta a transação assinada")
        
    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    deploy_contract() 