<!--
🔐 ARQUIVO ASSINADO DIGITALMENTE

✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
📅 Validade: 10 anos (até 2035)
🔒 Método: RSA-4096 + SHA-512
📜 Verificação: SIGNATURE.md
⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
-->


# YieldSwap SDK

SDK para integração com o protocolo YieldSwap.

## Instalação

```bash
yarn add @yieldswap/sdk
```

## Uso

```typescript
import { YieldSwap } from '@yieldswap/sdk';

const sdk = new YieldSwap({
  api: {
    baseURL: 'http://localhost:3001',
  },
  websocket: {
    url: 'ws://localhost:3001',
  },
  sentry: {
    dsn: 'YOUR_SENTRY_DSN',
    environment: 'production',
  },
});

// Conectar ao WebSocket
sdk.connect();

// Obter rota de swap
const route = await sdk.getApi().getSwapRoute('USDC', 'XLM', '100');

// Obter APY de um vault
const vault = await sdk.getApi().getVaultApy('XLM');

// Simular swap e depósito
const simulation = await sdk.getApi().simulateSwapAndDeposit(
  'USDC',
  'XLM',
  '100',
  'G...',
);

// Desconectar do WebSocket
sdk.disconnect();
```

## API

### YieldSwap

#### Construtor

```typescript
new YieldSwap(config: SdkConfig)
```

##### SdkConfig

```typescript
interface SdkConfig {
  api: {
    baseURL: string;
    timeout?: number;
    headers?: Record<string, string>;
  };
  websocket: {
    url: string;
    reconnection?: boolean;
    reconnectionDelay?: number;
    reconnectionDelayMax?: number;
  };
  sentry?: {
    dsn: string;
    environment?: string;
  };
}
```

#### Métodos

- `connect(): void` - Conecta ao WebSocket
- `disconnect(): void` - Desconecta do WebSocket
- `getApi(): Api` - Retorna a instância da API
- `getWebSocket(): WebSocket` - Retorna a instância do WebSocket
- `getWallet(): Wallet` - Retorna a instância da carteira

### Api

#### Métodos

- `getSwapRoute(tokenIn: string, tokenOut: string, amountIn: string): Promise<SwapRoute>`
- `getVaultApy(asset: string): Promise<VaultInfo>`
- `getBestVault(asset: string): Promise<VaultInfo>`
- `simulateSwapAndDeposit(tokenIn: string, tokenOut: string, amountIn: string, userAddress: string): Promise<SimulationResult>`

### WebSocket

#### Métodos

- `connect(): void`
- `disconnect(): void`
- `subscribeToVault(vaultAddress: string, callback: (data: ApyUpdate) => void): void`
- `unsubscribeFromVault(vaultAddress: string, callback: (data: ApyUpdate) => void): void`

### Wallet

#### Métodos

- `connect(): Promise<WalletInfo>`
- `disconnect(): Promise<void>`
- `getBalance(asset: string): Promise<string>`
- `signTransaction(xdr: string): Promise<string>`
- `submitTransaction(signedXdr: string): Promise<string>`
- `isConnected(): boolean`
- `getAddress(): string`
- `getPublicKey(): string`
- `getNetwork(): string`

## Tipos

### SwapRoute

```typescript
interface SwapRoute {
  path: string[];
  amountOut: string;
  priceImpact: string;
}
```

### VaultInfo

```typescript
interface VaultInfo {
  address: string;
  apy: number;
}
```

### ApyUpdate

```typescript
interface ApyUpdate {
  vault: string;
  apy: number;
  timestamp: string;
}
```

### SimulationResult

```typescript
interface SimulationResult {
  route: SwapRoute;
  vault: VaultInfo;
  gasEstimate: string;
  success: boolean;
}
```

### WalletInfo

```typescript
interface WalletInfo {
  address: string;
  publicKey: string;
  network: string;
  isConnected: boolean;
}
```

## Erros

O SDK exporta as seguintes classes de erro:

- `YieldSwapError` - Erro base
- `WalletNotConnectedError`
- `InsufficientBalanceError`
- `InvalidAmountError`
- `InvalidAddressError`
- `InvalidSlippageError`
- `TransactionFailedError`
- `UserRejectedError`
- `NetworkError`

## Desenvolvimento

```bash
# Instalar dependências
yarn install

# Executar testes
yarn test

# Construir SDK
yarn build

# Executar Storybook
yarn storybook
```

## Licença

MIT 