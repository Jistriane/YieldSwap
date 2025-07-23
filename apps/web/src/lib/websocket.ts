import { io, Socket } from 'socket.io-client';

export class WebSocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 segundo
  private subscriptions: Set<string> = new Set();

  constructor(private readonly url: string) {}

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(this.url, {
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 10000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket conectado');
      this.reconnectAttempts = 0;
      
      // Resubscrever aos vaults após reconexão
      this.subscriptions.forEach((vault) => {
        this.subscribeToVault(vault);
      });
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('WebSocket desconectado:', reason);
      
      if (reason === 'io server disconnect') {
        // Reconectar se o servidor desconectou
        this.connect();
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Erro de conexão:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Máximo de tentativas de reconexão atingido');
        this.socket?.close();
      }
    });

    this.socket.on('error', (error: Error) => {
      console.error('Erro no WebSocket:', error);
    });
  }

  subscribeToVault(vaultAddress: string) {
    if (!this.socket?.connected) {
      console.warn('WebSocket não conectado. Tentando reconectar...');
      this.connect();
      return;
    }

    this.socket.emit('subscribe', { vault: vaultAddress });
    this.subscriptions.add(vaultAddress);
  }

  unsubscribeFromVault(vaultAddress: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('unsubscribe', { vault: vaultAddress });
    this.subscriptions.delete(vaultAddress);
  }

  onApyUpdate(callback: (data: { vault: string; apy: number }) => void) {
    this.socket?.on('apyUpdate', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.subscriptions.clear();
    }
  }
} 