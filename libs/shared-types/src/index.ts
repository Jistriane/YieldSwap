/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


// Interfaces de Request/Response
export interface RouteRequest {
  sellToken: string;  // contract id
  buyToken: string;   // contract id
  amountIn: string;   // decimal string
  slippageBps?: number; // default 100 = 1%
  userAddress?: string; // endereço Stellar
}

export interface RouteResponse {
  route: {
    path: string[];    // array de contract ids
    amountOut: string; // decimal string
    priceImpact: string; // decimal string
    splitTrades?: {
      path: string[];
      proportion: string; // decimal string 0-1
    }[];
  };
  minOut: string;     // decimal string com slippage aplicado
  gasEstimate: string; // decimal string em stroops
}

export interface ApyItem {
  vault: string;      // contract id
  asset: string;      // contract id do token
  apy: string;        // decimal string
  tvl: string;        // decimal string
  timestamp: number;  // unix timestamp
}

export interface VaultInfo {
  address: string;    // contract id
  asset: string;      // contract id do token
  name: string;
  description: string;
  strategies: {
    address: string;  // contract id
    name: string;
    apy: string;      // decimal string
    allocation: string; // decimal string 0-1
  }[];
}

// DTOs para validação
export class CreateRouteDto implements RouteRequest {
  sellToken: string;
  buyToken: string;
  amountIn: string;
  slippageBps?: number;
  userAddress?: string;

  constructor(data: RouteRequest) {
    this.sellToken = data.sellToken;
    this.buyToken = data.buyToken;
    this.amountIn = data.amountIn;
    this.slippageBps = data.slippageBps || 100; // default 1%
    this.userAddress = data.userAddress;
  }

  validate(): boolean {
    // Validar contract ids
    if (!this.sellToken.match(/^[A-Z0-9]{56}$/)) return false;
    if (!this.buyToken.match(/^[A-Z0-9]{56}$/)) return false;
    
    // Validar amount
    if (!this.amountIn.match(/^\d+(\.\d+)?$/)) return false;
    
    // Validar slippage
    const slippage = this.slippageBps ?? 100;
    if (slippage < 0 || slippage > 1000) return false;
    
    // Validar endereço se fornecido
    if (this.userAddress && !this.userAddress.match(/^G[A-Z0-9]{55}$/)) return false;
    
    return true;
  }
}

// Tipos para WebSocket
export interface ApyUpdateEvent {
  vault: string;
  asset: string;
  oldApy: string;
  newApy: string;
  timestamp: number;
}

// Tipos para métricas
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  redis: {
    connected: boolean;
    latencyMs: number;
  };
  rpc: {
    connected: boolean;
    latencyMs: number;
    blockHeight: number;
  };
  oracle: {
    lastUpdate: number;
    staleness: number;
  };
} 