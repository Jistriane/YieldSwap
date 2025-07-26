/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


import { io, Socket } from 'socket.io-client';
import { WebSocketConfig, ApyUpdate } from './types';

export class WebSocket {
  private socket: Socket | null = null;
  private subscribers: Map<string, Set<(data: ApyUpdate) => void>> = new Map();

  constructor(private config: WebSocketConfig) {}

  connect(): void {
    if (this.socket) return;

    this.socket = io(this.config.url, {
      transports: ['websocket'],
      reconnection: this.config.reconnection ?? true,
      reconnectionDelay: this.config.reconnectionDelay ?? 1000,
      reconnectionDelayMax: this.config.reconnectionDelayMax ?? 5000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('apyUpdate', (data: ApyUpdate) => {
      const subscribers = this.subscribers.get(data.vault);
      if (subscribers) {
        subscribers.forEach((callback) => callback(data));
      }
    });
  }

  disconnect(): void {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  subscribeToVault(vaultAddress: string, callback: (data: ApyUpdate) => void): void {
    if (!this.subscribers.has(vaultAddress)) {
      this.subscribers.set(vaultAddress, new Set());
    }
    this.subscribers.get(vaultAddress)?.add(callback);

    if (this.socket) {
      this.socket.emit('subscribeToVault', vaultAddress);
    }
  }

  unsubscribeFromVault(vaultAddress: string, callback: (data: ApyUpdate) => void): void {
    const subscribers = this.subscribers.get(vaultAddress);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscribers.delete(vaultAddress);
        if (this.socket) {
          this.socket.emit('unsubscribeFromVault', vaultAddress);
        }
      }
    }
  }
} 