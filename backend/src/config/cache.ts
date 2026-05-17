import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

// ─── Cache TTL constants (seconds) ───────────────────────────────────────────

export const CacheTTL = {
  PRODUCT_LIST: 5 * 60,       // 5 minutes
  PRODUCT_DETAIL: 10 * 60,    // 10 minutes
  CATEGORY_LIST: 30 * 60,     // 30 minutes
  REVIEW_LIST: 5 * 60,        // 5 minutes
  USER_PROFILE: 60 * 60,      // 1 hour
} as const;

// ─── Cache key builders ───────────────────────────────────────────────────────

export const CacheKey = {
  productList: (params: string) => `products:list:${params}`,
  productDetail: (id: string) => `products:detail:${id}`,
  categoryList: () => 'categories:list',
  reviewList: (productId: string, params: string) => `reviews:product:${productId}:${params}`,
  userProfile: (userId: string) => `users:profile:${userId}`,
} as const;

// ─── Service ──────────────────────────────────────────────────────────────────

export class CacheService {
  private client: RedisClientType | null = null;
  private connected = false;

  async connect(url: string): Promise<void> {
    try {
      this.client = createClient({ url }) as RedisClientType;

      this.client.on('error', (err) => {
        logger.warn('Redis client error:', err.message);
        this.connected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis connected');
        this.connected = true;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });

      await this.client.connect();
      this.connected = true;
    } catch (err) {
      logger.warn('Redis connection failed – caching disabled:', (err as Error).message);
      this.connected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.connected) {
      await this.client.disconnect();
      this.connected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected || !this.client) return null;
    try {
      const data = await this.client.get(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch (err) {
      logger.warn(`Cache GET failed for key "${key}":`, (err as Error).message);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    if (!this.connected || !this.client) return;
    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      logger.warn(`Cache SET failed for key "${key}":`, (err as Error).message);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.connected || !this.client) return;
    try {
      await this.client.del(key);
    } catch (err) {
      logger.warn(`Cache DEL failed for key "${key}":`, (err as Error).message);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.connected || !this.client) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.debug(`Cache invalidated ${keys.length} keys matching "${pattern}"`);
      }
    } catch (err) {
      logger.warn(`Cache invalidatePattern failed for "${pattern}":`, (err as Error).message);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// Singleton instance
export const cacheService = new CacheService();
