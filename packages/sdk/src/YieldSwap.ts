import { Api } from './api';
import { WebSocket } from './websocket';
import { Wallet } from './wallet';
import { SdkConfig } from './types';
import { initSentry } from './sentry';

export class YieldSwap {
  private api: Api;
  private websocket: WebSocket;
  private wallet: Wallet;

  constructor(config: SdkConfig) {
    if (config.sentry) {
      initSentry(config.sentry.dsn, config.sentry.environment);
    }

    this.api = new Api(config.api);
    this.websocket = new WebSocket(config.websocket);
    this.wallet = new Wallet(config.api.baseURL);
  }

  connect(): void {
    this.websocket.connect();
  }

  disconnect(): void {
    this.websocket.disconnect();
  }

  getApi(): Api {
    return this.api;
  }

  getWebSocket(): WebSocket {
    return this.websocket;
  }

  getWallet(): Wallet {
    return this.wallet;
  }
} 