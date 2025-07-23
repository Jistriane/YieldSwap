import Redis from 'ioredis';
import { EventEmitter } from 'events';

export class RedisClient extends EventEmitter {
  private static instance: RedisClient;
  private client: Redis;
  private subscriber: Redis;
  private publisher: Redis;

  private constructor() {
    super();
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Cliente principal para operações de cache
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    // Cliente dedicado para subscrições
    this.subscriber = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });

    // Cliente dedicado para publicações
    this.publisher = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Eventos do cliente principal
    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
      this.emit('error', error);
    });

    this.client.on('ready', () => {
      console.log('Redis client ready');
      this.emit('ready');
    });

    // Eventos do subscriber
    this.subscriber.on('message', (channel, message) => {
      this.emit('message', channel, message);
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  // Cache operations
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  // Pub/Sub operations
  async subscribe(channel: string): Promise<void> {
    await this.subscriber.subscribe(channel);
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
  }

  async publish(channel: string, message: string): Promise<number> {
    return this.publisher.publish(channel, message);
  }

  // APY specific methods
  async getApy(asset: string, vault: string): Promise<string | null> {
    return this.get(`apy:${asset}:${vault}`);
  }

  async setApy(asset: string, vault: string, apy: string): Promise<void> {
    const key = `apy:${asset}:${vault}`;
    await this.set(key, apy, 30); // TTL 30 segundos
    await this.publish('apy.updated', JSON.stringify({ asset, vault, apy }));
  }

  // Health check
  async ping(): Promise<{ connected: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.client.ping();
      return {
        connected: true,
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      return {
        connected: false,
        latencyMs: -1,
      };
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    await this.client.quit();
    await this.subscriber.quit();
    await this.publisher.quit();
  }
} 