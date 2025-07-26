/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


export interface SwapRoute {
  path: string[];
  amountOut: string;
  priceImpact: string;
}

export interface VaultInfo {
  address: string;
  apy: number;
}

export interface ApyUpdate {
  vault: string;
  apy: number;
  timestamp: string;
}

export interface SimulationResult {
  route: SwapRoute;
  vault: VaultInfo;
  gasEstimate: string;
  success: boolean;
}

export interface WalletInfo {
  address: string;
  publicKey: string;
  network: string;
  isConnected: boolean;
}

export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface WebSocketConfig {
  url: string;
  reconnection?: boolean;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
}

export interface SdkConfig {
  api: ApiConfig;
  websocket: WebSocketConfig;
  sentry?: {
    dsn: string;
    environment?: string;
  };
} 