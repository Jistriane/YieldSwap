#!/bin/bash

# Lista de RPCs para tentar
RPC_ENDPOINTS=(
    "https://soroban-testnet.stellar.org:443"
    "https://rpc-testnet.stellar.org:443"
    "https://horizon-testnet.stellar.org"
    "https://rpc-futurenet.stellar.org:443"
)

# Configurações
WALLET=$(cat wallet.txt)
WASM_FILE="yield_swap_router.optimized.wasm"
TESTNET_PASSPHRASE="Test SDF Network ; September 2015"
FUTURENET_PASSPHRASE="Test SDF Future Network ; October 2022"

# Função para tentar o deploy
try_deploy() {
    local rpc_url=$1
    local network=$2
    local passphrase=$3
    
    echo "Tentando deploy em $rpc_url..."
    
    soroban contract deploy \
        --wasm "$WASM_FILE" \
        --source "$WALLET" \
        --rpc-url "$rpc_url" \
        --network-passphrase "$passphrase" \
        --network "$network"
    
    if [ $? -eq 0 ]; then
        return 0
    fi
    return 1
}

# Tenta cada RPC
for rpc in "${RPC_ENDPOINTS[@]}"; do
    if [[ $rpc == *"futurenet"* ]]; then
        if try_deploy "$rpc" "futurenet" "$FUTURENET_PASSPHRASE"; then
            echo "Deploy bem sucedido na Futurenet!"
            exit 0
        fi
    else
        if try_deploy "$rpc" "testnet" "$TESTNET_PASSPHRASE"; then
            echo "Deploy bem sucedido na Testnet!"
            exit 0
        fi
    fi
    echo "Falha no deploy em $rpc. Tentando próximo..."
    sleep 2
done

echo "Todas as tentativas falharam. Por favor, tente novamente mais tarde."
exit 1 