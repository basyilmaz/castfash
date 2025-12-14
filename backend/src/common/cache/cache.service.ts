import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Simple in-memory cache implementation
 * Can be replaced with Redis when needed
 */

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(CacheService.name);
    private cache: Map<string, CacheEntry<unknown>> = new Map();
    private cleanupInterval: NodeJS.Timeout | null = null;
    private readonly defaultTtl: number;
    private isRedisEnabled = false;
    private redisClient: any = null;

    constructor(private readonly configService: ConfigService) {
        this.defaultTtl = 300; // 5 minutes default
    }

    async onModuleInit() {
        // Start cleanup interval
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpired();
        }, 60000); // Cleanup every minute

        // Try to connect to Redis if configured
        const redisUrl = this.configService.get<string>('REDIS_URL');
        if (redisUrl) {
            try {
                // Dynamic import to avoid requiring redis when not used
                const { createClient } = await import('redis');
                this.redisClient = createClient({ url: redisUrl });

                this.redisClient.on('error', (err: Error) => {
                    this.logger.warn(`Redis connection error: ${err.message}. Falling back to memory cache.`);
                    this.isRedisEnabled = false;
                });

                await this.redisClient.connect();
                this.isRedisEnabled = true;
                this.logger.log('✅ Redis cache connected successfully');
            } catch (error: any) {
                this.logger.warn(`Redis not available: ${error.message}. Using in-memory cache.`);
                this.isRedisEnabled = false;
            }
        } else {
            this.logger.log('📦 Using in-memory cache (REDIS_URL not configured)');
        }
    }

    async onModuleDestroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        if (this.redisClient && this.isRedisEnabled) {
            await this.redisClient.quit();
        }
    }

    /**
     * Get a value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        if (this.isRedisEnabled && this.redisClient) {
            try {
                const value = await this.redisClient.get(key);
                return value ? JSON.parse(value) : null;
            } catch (error) {
                this.logger.warn(`Redis get error for key ${key}, falling back to memory`);
            }
        }

        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.value as T;
    }

    /**
     * Set a value in cache
     */
    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const ttl = ttlSeconds ?? this.defaultTtl;

        if (this.isRedisEnabled && this.redisClient) {
            try {
                await this.redisClient.setEx(key, ttl, JSON.stringify(value));
                return;
            } catch (error) {
                this.logger.warn(`Redis set error for key ${key}, falling back to memory`);
            }
        }

        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttl * 1000,
        });
    }

    /**
     * Delete a value from cache
     */
    async del(key: string): Promise<void> {
        if (this.isRedisEnabled && this.redisClient) {
            try {
                await this.redisClient.del(key);
            } catch (error) {
                this.logger.warn(`Redis del error for key ${key}`);
            }
        }

        this.cache.delete(key);
    }

    /**
     * Delete all keys matching a pattern
     */
    async delPattern(pattern: string): Promise<void> {
        if (this.isRedisEnabled && this.redisClient) {
            try {
                const keys = await this.redisClient.keys(pattern);
                if (keys.length > 0) {
                    await this.redisClient.del(keys);
                }
            } catch (error) {
                this.logger.warn(`Redis delPattern error for ${pattern}`);
            }
        }

        // Also clean memory cache
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get or set: fetches from cache, or executes factory and caches result
     */
    async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        ttlSeconds?: number,
    ): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        const value = await factory();
        await this.set(key, value, ttlSeconds);
        return value;
    }

    /**
     * Clear all cache
     */
    async clear(): Promise<void> {
        if (this.isRedisEnabled && this.redisClient) {
            try {
                await this.redisClient.flushDb();
            } catch (error) {
                this.logger.warn('Redis flushDb error');
            }
        }

        this.cache.clear();
        this.logger.log('Cache cleared');
    }

    /**
     * Get cache stats
     */
    getStats(): {
        type: 'redis' | 'memory';
        size: number;
        isConnected: boolean;
    } {
        return {
            type: this.isRedisEnabled ? 'redis' : 'memory',
            size: this.cache.size,
            isConnected: this.isRedisEnabled,
        };
    }

    /**
     * Cleanup expired entries (memory cache only)
     */
    private cleanupExpired(): void {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            this.logger.debug(`Cleaned up ${cleaned} expired cache entries`);
        }
    }
}

// Cache key builders
export const CacheKeys = {
    // Organization related
    organization: (id: number) => `org:${id}`,
    organizationCredits: (id: number) => `org:${id}:credits`,

    // Categories
    allCategories: () => 'categories:all',
    categoryById: (id: number) => `categories:${id}`,

    // Scenes
    allScenes: () => 'scenes:all',
    scenesByCategory: (category: string) => `scenes:category:${category}`,
    sceneById: (id: number) => `scenes:${id}`,

    // Products
    productById: (id: number) => `products:${id}`,
    productsByOrg: (orgId: number) => `products:org:${orgId}`,

    // Models
    modelById: (id: number) => `models:${id}`,
    modelsByOrg: (orgId: number) => `models:org:${orgId}`,

    // Generation
    generationById: (id: number) => `generation:${id}`,
    generationsByOrg: (orgId: number) => `generations:org:${orgId}`,

    // AI Providers
    aiProviderConfigs: () => 'ai-providers:configs',
    aiProviderHealth: (provider: string) => `ai-providers:health:${provider}`,

    // Prompts
    promptTemplates: () => 'prompts:templates',
    promptPresets: () => 'prompts:presets',

    // Stats
    systemStats: () => 'stats:system',
    orgStats: (orgId: number) => `stats:org:${orgId}`,
};

// TTL constants (in seconds)
export const CacheTTL = {
    SHORT: 60,           // 1 minute
    MEDIUM: 300,         // 5 minutes
    LONG: 900,           // 15 minutes
    HOUR: 3600,          // 1 hour
    DAY: 86400,          // 24 hours

    // Specific TTLs
    CATEGORIES: 3600,    // Categories rarely change
    SCENES: 1800,        // 30 minutes
    PRODUCTS: 300,       // Products may change frequently
    STATS: 60,           // Stats need to be fresh
    AI_HEALTH: 30,       // AI health checks
};
