/**
 * Rate Limiting Configuration
 *
 * This file documents the rate limiting rules applied across the API.
 * All limits are per-user (authenticated) or per-IP (unauthenticated).
 */

export const RATE_LIMITS = {
  // Global defaults (all endpoints)
  global: {
    short: {
      limit: 10,
      ttl: 1000,
      description: '10 requests per second (burst protection)',
    },
    medium: { limit: 100, ttl: 60000, description: '100 requests per minute' },
    long: { limit: 1000, ttl: 3600000, description: '1000 requests per hour' },
  },

  // Authentication endpoints (stricter)
  auth: {
    signup: {
      short: { limit: 2, ttl: 1000 },
      medium: { limit: 5, ttl: 60000 },
      description: '5 signups per minute per IP',
    },
    login: {
      short: { limit: 3, ttl: 1000 },
      medium: { limit: 10, ttl: 60000 },
      description: '10 login attempts per minute (brute force protection)',
    },
    forgotPassword: {
      medium: { limit: 3, ttl: 60000 },
      long: { limit: 5, ttl: 3600000 },
      description: '3 per minute, 5 per hour',
    },
    refresh: {
      medium: { limit: 30, ttl: 60000 },
      description: '30 token refreshes per minute',
    },
  },

  // Generation endpoints (expensive operations)
  generation: {
    generate: {
      short: { limit: 2, ttl: 1000 },
      medium: { limit: 10, ttl: 60000 },
      description: '10 generations per minute',
    },
    batchGenerate: {
      short: { limit: 1, ttl: 1000 },
      medium: { limit: 5, ttl: 60000 },
      description: '5 batch operations per minute',
    },
  },

  // Upload endpoints
  upload: {
    file: {
      medium: { limit: 20, ttl: 60000 },
      description: '20 file uploads per minute',
    },
  },
};

/**
 * Error messages for rate limiting
 */
export const RATE_LIMIT_MESSAGES = {
  tr: {
    default: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.',
    login: 'Çok fazla giriş denemesi. Lütfen 1 dakika bekleyin.',
    signup: 'Çok fazla kayıt denemesi. Lütfen daha sonra tekrar deneyin.',
    generation: 'Çok fazla görsel üretim isteği. Lütfen biraz bekleyin.',
    forgotPassword: 'Çok fazla şifre sıfırlama isteği. Lütfen 1 saat bekleyin.',
  },
  en: {
    default: 'Too many requests. Please wait a moment.',
    login: 'Too many login attempts. Please wait 1 minute.',
    signup: 'Too many signup attempts. Please try again later.',
    generation: 'Too many generation requests. Please wait a moment.',
    forgotPassword: 'Too many password reset requests. Please wait 1 hour.',
  },
};
