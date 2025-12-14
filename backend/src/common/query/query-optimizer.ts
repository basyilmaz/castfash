/**
 * Query Performance Best Practices for CastFash
 * 
 * This file documents the query optimization strategies used in the codebase
 * and provides utilities for monitoring query performance.
 */

import { PrismaService } from '../../prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Query Performance Analysis Utility
 * Helps identify N+1 queries and slow operations
 */
@Injectable()
export class QueryAnalyzer {
    private readonly logger = new Logger(QueryAnalyzer.name);
    private queryLog: Array<{ query: string; duration: number; timestamp: Date }> = [];

    /**
     * Log a query for analysis
     */
    logQuery(query: string, duration: number): void {
        this.queryLog.push({
            query: query.slice(0, 200), // Truncate for logging
            duration,
            timestamp: new Date(),
        });

        // Keep only last 1000 queries
        if (this.queryLog.length > 1000) {
            this.queryLog = this.queryLog.slice(-1000);
        }

        // Warn for slow queries (> 500ms)
        if (duration > 500) {
            this.logger.warn(`Slow query detected (${duration}ms): ${query.slice(0, 100)}...`);
        }
    }

    /**
     * Get slow queries from the log
     */
    getSlowQueries(thresholdMs: number = 100): typeof this.queryLog {
        return this.queryLog.filter(q => q.duration > thresholdMs);
    }

    /**
     * Get average query time
     */
    getAverageQueryTime(): number {
        if (this.queryLog.length === 0) return 0;
        const total = this.queryLog.reduce((sum, q) => sum + q.duration, 0);
        return total / this.queryLog.length;
    }

    /**
     * Clear query log
     */
    clearLog(): void {
        this.queryLog = [];
    }

    /**
     * Get query statistics
     */
    getStats(): {
        totalQueries: number;
        averageDuration: number;
        slowQueries: number;
        fastestQuery: number;
        slowestQuery: number;
    } {
        if (this.queryLog.length === 0) {
            return {
                totalQueries: 0,
                averageDuration: 0,
                slowQueries: 0,
                fastestQuery: 0,
                slowestQuery: 0,
            };
        }

        const durations = this.queryLog.map(q => q.duration);
        return {
            totalQueries: this.queryLog.length,
            averageDuration: this.getAverageQueryTime(),
            slowQueries: this.getSlowQueries(100).length,
            fastestQuery: Math.min(...durations),
            slowestQuery: Math.max(...durations),
        };
    }
}

/**
 * N+1 Query Prevention Patterns
 * 
 * The following patterns are used throughout the codebase to prevent N+1 queries:
 */

/**
 * Pattern 1: Eager Loading with Include
 * 
 * WRONG (N+1):
 * const users = await prisma.user.findMany();
 * for (const user of users) {
 *   user.organizations = await prisma.organizationUser.findMany({ where: { userId: user.id } });
 * }
 * 
 * CORRECT:
 * const users = await prisma.user.findMany({
 *   include: {
 *     organizations: {
 *       include: { organization: true }
 *     }
 *   }
 * });
 */

/**
 * Pattern 2: Parallel Queries with Promise.all
 * 
 * WRONG (Sequential):
 * const users = await prisma.user.findMany();
 * const orgs = await prisma.organization.findMany();
 * const products = await prisma.product.findMany();
 * 
 * CORRECT (Parallel):
 * const [users, orgs, products] = await Promise.all([
 *   prisma.user.findMany(),
 *   prisma.organization.findMany(),
 *   prisma.product.findMany(),
 * ]);
 */

/**
 * Pattern 3: Count Aggregation with _count
 * 
 * WRONG (N+1):
 * const orgs = await prisma.organization.findMany();
 * for (const org of orgs) {
 *   org.userCount = await prisma.organizationUser.count({ where: { organizationId: org.id } });
 * }
 * 
 * CORRECT:
 * const orgs = await prisma.organization.findMany({
 *   include: {
 *     _count: {
 *       select: { users: true, products: true }
 *     }
 *   }
 * });
 */

/**
 * Pattern 4: Select Only Required Fields
 * 
 * WRONG:
 * const users = await prisma.user.findMany(); // Fetches all fields
 * 
 * CORRECT:
 * const users = await prisma.user.findMany({
 *   select: { id: true, email: true, createdAt: true }
 * });
 */

/**
 * Pattern 5: Limit Nested Relations
 * 
 * WRONG:
 * const products = await prisma.product.findMany({
 *   include: { generatedImages: true } // Could be thousands of images
 * });
 * 
 * CORRECT:
 * const products = await prisma.product.findMany({
 *   include: {
 *     generatedImages: {
 *       take: 5, // Limit to 5 most recent
 *       orderBy: { createdAt: 'desc' }
 *     }
 *   }
 * });
 */

/**
 * Pattern 6: Batch Operations with Transaction
 * 
 * WRONG (Multiple queries):
 * for (const userId of userIds) {
 *   await prisma.user.update({ where: { id: userId }, data: { isActive: true } });
 * }
 * 
 * CORRECT (Batch):
 * await prisma.user.updateMany({
 *   where: { id: { in: userIds } },
 *   data: { isActive: true }
 * });
 */

export const N1_PREVENTION_PATTERNS = {
    EAGER_LOADING: 'Use include/select for related data',
    PARALLEL_QUERIES: 'Use Promise.all for independent queries',
    COUNT_AGGREGATION: 'Use _count instead of separate count queries',
    FIELD_SELECTION: 'Use select to fetch only required fields',
    LIMIT_RELATIONS: 'Use take/skip for large nested relations',
    BATCH_OPERATIONS: 'Use updateMany/deleteMany for bulk operations',
};

/**
 * Query optimization utilities
 */
export const QueryOptimizationUtils = {
    /**
     * Create a pagination wrapper with consistent structure
     */
    paginate: async <T>(
        query: () => Promise<T[]>,
        countQuery: () => Promise<number>,
    ): Promise<{ items: T[]; total: number }> => {
        const [items, total] = await Promise.all([query(), countQuery()]);
        return { items, total };
    },

    /**
     * Create optimized select for list views
     * Only includes essential fields for list display
     */
    listSelect: {
        user: { id: true, email: true, createdAt: true, isSuperAdmin: true },
        organization: { id: true, name: true, remainingCredits: true, createdAt: true },
        product: { id: true, name: true, sku: true, productImageUrl: true, createdAt: true },
        modelProfile: { id: true, name: true, gender: true, createdAt: true },
        scenePreset: { id: true, name: true, type: true },
    },
};
