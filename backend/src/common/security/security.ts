/**
 * Security Utilities and Middleware for CastFash
 * 
 * Provides CSRF protection, XSS sanitization, and other security measures
 */

import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

/**
 * CSRF Token Service
 * Generates and validates CSRF tokens for form submissions
 */
@Injectable()
export class CsrfService {
    private readonly tokens: Map<string, { token: string; expires: number }> = new Map();
    private readonly TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

    /**
     * Generate a new CSRF token for a session
     */
    generateToken(sessionId: string): string {
        const token = crypto.randomBytes(32).toString('hex');
        this.tokens.set(sessionId, {
            token,
            expires: Date.now() + this.TOKEN_EXPIRY,
        });
        return token;
    }

    /**
     * Validate a CSRF token
     */
    validateToken(sessionId: string, token: string): boolean {
        const stored = this.tokens.get(sessionId);
        if (!stored) return false;
        if (Date.now() > stored.expires) {
            this.tokens.delete(sessionId);
            return false;
        }
        return stored.token === token;
    }

    /**
     * Remove expired tokens (call periodically)
     */
    cleanupExpiredTokens(): void {
        const now = Date.now();
        for (const [key, value] of this.tokens.entries()) {
            if (now > value.expires) {
                this.tokens.delete(key);
            }
        }
    }
}

/**
 * XSS Sanitization utilities
 */
export class XssSanitizer {
    /**
     * HTML entity encoding for XSS prevention
     */
    static escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Remove potentially dangerous HTML tags
     */
    static stripDangerousTags(html: string): string {
        const dangerousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
            /<embed\b[^>]*>/gi,
            /on\w+\s*=/gi, // Event handlers like onclick=, onerror=
            /javascript:/gi,
            /data:/gi, // Data URIs can be dangerous
        ];

        let result = html;
        for (const pattern of dangerousPatterns) {
            result = result.replace(pattern, '');
        }
        return result;
    }

    /**
     * Sanitize an object recursively
     */
    static sanitizeObject<T extends Record<string, any>>(obj: T): T {
        const sanitized: Record<string, any> = {};

        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = this.stripDangerousTags(value);
            } else if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    sanitized[key] = value.map((item) =>
                        typeof item === 'string'
                            ? this.stripDangerousTags(item)
                            : typeof item === 'object'
                                ? this.sanitizeObject(item)
                                : item
                    );
                } else {
                    sanitized[key] = this.sanitizeObject(value);
                }
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized as T;
    }
}

/**
 * XSS Sanitization Middleware
 * Automatically sanitizes request body, query, and params
 */
@Injectable()
export class XssSanitizationMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void {
        if (req.body && typeof req.body === 'object') {
            req.body = XssSanitizer.sanitizeObject(req.body);
        }
        if (req.query && typeof req.query === 'object') {
            req.query = XssSanitizer.sanitizeObject(req.query as Record<string, any>);
        }
        next();
    }
}

/**
 * Security Headers Middleware
 * Adds important security headers to all responses
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void {
        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');

        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // XSS Protection (legacy but still useful)
        res.setHeader('X-XSS-Protection', '1; mode=block');

        // Referrer Policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Content Security Policy
        res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
        );

        // Permissions Policy
        res.setHeader(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(), interest-cohort=()'
        );

        // Remove X-Powered-By header
        res.removeHeader('X-Powered-By');

        next();
    }
}

/**
 * SQL Injection Prevention utilities
 * Note: Prisma ORM already prevents SQL injection through parameterized queries
 */
export class SqlInjectionPrevention {
    private static readonly dangerousPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
        /(-{2}|\/\*|\*\/|;)/,
        /(\'|\"|\\)/,
    ];

    /**
     * Check if a string contains potential SQL injection
     */
    static containsSqlInjection(value: string): boolean {
        return this.dangerousPatterns.some((pattern) => pattern.test(value));
    }

    /**
     * Validate user input for SQL injection
     */
    static validateInput(value: string, fieldName: string): void {
        if (this.containsSqlInjection(value)) {
            throw new BadRequestException(`Invalid characters in ${fieldName}`);
        }
    }
}

/**
 * Input Validation utilities
 */
export class InputValidator {
    /**
     * Validate email format
     */
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate URL format
     */
    static isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate UUID format
     */
    static isValidUuid(uuid: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    /**
     * Validate numeric ID (positive integer)
     */
    static isValidNumericId(id: string | number): boolean {
        const numId = typeof id === 'string' ? parseInt(id, 10) : id;
        return Number.isInteger(numId) && numId > 0;
    }

    /**
     * Sanitize filename for upload
     */
    static sanitizeFilename(filename: string): string {
        return filename
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .replace(/\.{2,}/g, '.')
            .slice(0, 255);
    }
}

/**
 * Rate limiting configuration
 * Already implemented via @nestjs/throttler in app.module.ts
 */
export const RATE_LIMIT_CONFIG = {
    // Short-term limits (prevent rapid repeated requests)
    short: {
        ttl: 1000, // 1 second
        limit: 5, // 5 requests per second
    },
    // Medium-term limits (prevent abuse)
    medium: {
        ttl: 60000, // 1 minute
        limit: 60, // 60 requests per minute
    },
    // Long-term limits (prevent sustained attacks)
    long: {
        ttl: 3600000, // 1 hour
        limit: 1000, // 1000 requests per hour
    },
};

/**
 * Password Policy
 */
export const PASSWORD_POLICY = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,

    validate(password: string): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (password.length < this.minLength) {
            errors.push(`Şifre en az ${this.minLength} karakter olmalıdır`);
        }
        if (password.length > this.maxLength) {
            errors.push(`Şifre en fazla ${this.maxLength} karakter olabilir`);
        }
        if (this.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Şifre en az bir büyük harf içermelidir');
        }
        if (this.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Şifre en az bir küçük harf içermelidir');
        }
        if (this.requireNumbers && !/[0-9]/.test(password)) {
            errors.push('Şifre en az bir rakam içermelidir');
        }
        if (this.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Şifre en az bir özel karakter içermelidir');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    },
};
