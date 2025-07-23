import { io, Socket } from 'socket.io-client';

interface ApyUpdate {
  vault: string;
  asset: string;
  apy: string;
  timestamp: number;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private subscriptions = new Map<string, Set<(data: ApyUpdate) => void>>();

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(process.env.NEXT_PUBLIC_WS_URL || '', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket conectado');
      // Resubscrever a todos os vaults após reconexão
      this.subscriptions.forEach((_, vault) => {
        this.socket?.emit('subscribe', { vault });
      });
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket desconectado');
    });

    this.socket.on('apy', (data: ApyUpdate) => {
      const subscribers = this.subscriptions.get(data.vault);
      if (subscribers) {
        subscribers.forEach((callback) => callback(data));
      }
    });

    this.socket.on('error', (error: Error) => {
      console.error('Erro no WebSocket:', error);
    });
  }

  subscribe(vault: string, callback: (data: ApyUpdate) => void) {
    if (!this.subscriptions.has(vault)) {
      this.subscriptions.set(vault, new Set());
    }
    this.subscriptions.get(vault)?.add(callback);

    if (this.socket?.connected) {
      this.socket.emit('subscribe', { vault });
    } else {
      this.connect();
    }

    return () => this.unsubscribe(vault, callback);
  }

  unsubscribe(vault: string, callback: (data: ApyUpdate) => void) {
    const subscribers = this.subscriptions.get(vault);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscriptions.delete(vault);
        this.socket?.emit('unsubscribe', { vault });
      }
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.subscriptions.clear();
  }
}

export const ws = new WebSocketClient(); 