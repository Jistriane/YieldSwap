import { Server } from '@stellar/stellar-sdk';
import { WalletInfo } from './types';

export class Wallet {
  private server: Server;
  private walletInfo: WalletInfo | null = null;

  constructor(rpcUrl: string) {
    this.server = new Server(rpcUrl, { allowHttp: true });
  }

  async connect(): Promise<WalletInfo> {
    // Implementar integração com Freighter
    throw new Error('Not implemented');
  }

  async disconnect(): Promise<void> {
    // Implementar integração com Freighter
    throw new Error('Not implemented');
  }

  async getBalance(asset: string): Promise<string> {
    if (!this.walletInfo?.address) {
      throw new Error('Wallet not connected');
    }

    const account = await this.server.loadAccount(this.walletInfo.address);
    const balance = account.balances.find(
      (b) => b.asset_type === asset || b.asset_code === asset,
    );

    return balance?.balance || '0';
  }

  async signTransaction(xdr: string): Promise<string> {
    // Implementar integração com Freighter
    throw new Error('Not implemented');
  }

  async submitTransaction(signedXdr: string): Promise<string> {
    const transaction = await this.server.submitTransaction(signedXdr);
    return transaction.hash;
  }

  isConnected(): boolean {
    return !!this.walletInfo?.isConnected;
  }

  getAddress(): string {
    if (!this.walletInfo?.address) {
      throw new Error('Wallet not connected');
    }
    return this.walletInfo.address;
  }

  getPublicKey(): string {
    if (!this.walletInfo?.publicKey) {
      throw new Error('Wallet not connected');
    }
    return this.walletInfo.publicKey;
  }

  getNetwork(): string {
    if (!this.walletInfo?.network) {
      throw new Error('Wallet not connected');
    }
    return this.walletInfo.network;
  }
} 