/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


interface ApyUpdate {
  vault: string;
  asset: string;
  apy: number;
  timestamp: number;
  trend: 'up' | 'down' | 'stable';
  volume24h: number;
  tvl: number;
}

interface WebSocketManager {
  socket: WebSocket | null;
  connected: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  subscriptions: Set<string>;
  listeners: Map<string, Set<(data: any) => void>>;
}

class YieldSwapWebSocket {
  private manager: WebSocketManager = {
    socket: null,
    connected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 2000,
    subscriptions: new Set(),
    listeners: new Map()
  };

  private wsUrl: string;

  constructor() {
    this.wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.manager.socket = new WebSocket(this.wsUrl);

        this.manager.socket.onopen = () => {
          console.log('WebSocket connected');
          this.manager.connected = true;
          this.manager.reconnectAttempts = 0;
          
          // Resubscribe to existing subscriptions
          this.manager.subscriptions.forEach(subscription => {
            this.send('subscribe', { asset: subscription });
          });

          resolve();
        };

        this.manager.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.manager.socket.onclose = () => {
          console.log('WebSocket disconnected');
          this.manager.connected = false;
          this.manager.socket = null;
          this.attemptReconnect();
        };

        this.manager.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.manager.reconnectAttempts >= this.manager.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.manager.reconnectAttempts++;
    const delay = this.manager.reconnectDelay * Math.pow(2, this.manager.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.manager.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  private handleMessage(message: any): void {
    const { type, data } = message;

    if (type === 'apy_update') {
      this.emit('apy_update', data);
    } else if (type === 'error') {
      this.emit('error', data);
    } else if (type === 'subscribed') {
      console.log('Successfully subscribed to:', data.asset);
    } else if (type === 'unsubscribed') {
      console.log('Successfully unsubscribed from:', data.asset);
    }
  }

  private send(type: string, data: any): void {
    if (this.manager.socket && this.manager.connected) {
      this.manager.socket.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  subscribe(asset: string): void {
    this.manager.subscriptions.add(asset);
    this.send('subscribe', { asset });
  }

  unsubscribe(asset: string): void {
    this.manager.subscriptions.delete(asset);
    this.send('unsubscribe', { asset });
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.manager.listeners.has(event)) {
      this.manager.listeners.set(event, new Set());
    }
    this.manager.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const listeners = this.manager.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.manager.listeners.delete(event);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.manager.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event listener:', error);
        }
      });
    }
  }

  disconnect(): void {
    if (this.manager.socket) {
      this.manager.socket.close();
      this.manager.socket = null;
    }
    this.manager.connected = false;
    this.manager.subscriptions.clear();
    this.manager.listeners.clear();
  }

  isConnected(): boolean {
    return this.manager.connected;
  }

  getSubscriptions(): string[] {
    return Array.from(this.manager.subscriptions);
  }
}

// Singleton instance
let wsInstance: YieldSwapWebSocket | null = null;

export function getWebSocketInstance(): YieldSwapWebSocket {
  if (!wsInstance) {
    wsInstance = new YieldSwapWebSocket();
  }
  return wsInstance;
}

export function connectWebSocket(): Promise<void> {
  const ws = getWebSocketInstance();
  return ws.connect();
}

export function subscribeToApy(asset: string, callback: (data: ApyUpdate) => void): () => void {
  const ws = getWebSocketInstance();
  
  ws.on('apy_update', callback);
  ws.subscribe(asset);

  // Return unsubscribe function
  return () => {
    ws.off('apy_update', callback);
    ws.unsubscribe(asset);
  };
}

export function disconnectWebSocket(): void {
  if (wsInstance) {
    wsInstance.disconnect();
    wsInstance = null;
  }
}

export type { ApyUpdate }; 