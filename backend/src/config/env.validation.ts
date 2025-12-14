import { z } from 'zod';

// =============================================================================
// Environment Variable Schema
// =============================================================================

export const envSchema = z.object({
  // ==========================================================================
  // Database Configuration (Required)
  // ==========================================================================
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(
      (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
      'DATABASE_URL must be a valid PostgreSQL connection string',
    ),

  // ==========================================================================
  // JWT Configuration (Required)
  // ==========================================================================
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security'),

  JWT_ACCESS_EXPIRES: z
    .string()
    .regex(
      /^\d+[smhdw]$/,
      'JWT_ACCESS_EXPIRES must be in format like "1h", "30m", "7d"',
    )
    .default('1h'),

  JWT_REFRESH_EXPIRES: z
    .string()
    .regex(
      /^\d+[smhdw]$/,
      'JWT_REFRESH_EXPIRES must be in format like "7d", "30d"',
    )
    .default('7d'),

  // Legacy support
  JWT_ACCESS_EXPIRES_IN: z.string().optional(),

  // ==========================================================================
  // Server Configuration
  // ==========================================================================
  PORT: z.string().default('3002'),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  MODE: z.enum(['development', 'production']).optional().default('development'),

  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'debug', 'verbose'])
    .default('info'),

  // ==========================================================================
  // Frontend URL (Required for emails)
  // ==========================================================================
  FRONTEND_URL: z
    .string()
    .url('FRONTEND_URL must be a valid URL')
    .default('http://localhost:3000'),

  // ==========================================================================
  // Email Configuration
  // ==========================================================================
  EMAIL_HOST: z.string().default(''),

  EMAIL_PORT: z.string().default('587'),

  EMAIL_SECURE: z.string().default('false'),

  EMAIL_USER: z.string().default(''),

  EMAIL_PASSWORD: z.string().default(''),

  EMAIL_FROM: z.string().default('CastFash <noreply@castfash.com>'),

  // ==========================================================================
  // AI Provider Configuration
  // ==========================================================================
  AI_PROVIDER_KIE_ENABLED: z.string().default('true'),

  AI_PROVIDER_KIE_API_KEY: z.string().optional().default(''),

  AI_PROVIDER_KIE_BASE_URL: z.string().optional().default(''),

  AI_PROVIDER_REPLICATE_ENABLED: z.string().default('false'),

  AI_PROVIDER_REPLICATE_API_KEY: z.string().optional().default(''),

  AI_PROVIDER_FAL_ENABLED: z.string().default('false'),

  AI_PROVIDER_FAL_API_KEY: z.string().optional().default(''),

  // ==========================================================================
  // Rate Limiting Configuration
  // ==========================================================================
  RATE_LIMIT_TTL: z.string().default('60000'),

  RATE_LIMIT_LIMIT: z.string().default('100'),

  // ==========================================================================
  // Optional: External URLs
  // ==========================================================================
  APP_PUBLIC_URL: z.string().url().optional(),

  BASE_URL: z.string().url().optional(),

  // ==========================================================================
  // Optional: Monitoring
  // ==========================================================================
  SENTRY_DSN: z.string().optional(),

  // ==========================================================================
  // Optional: Stripe (for payment)
  // ==========================================================================
  STRIPE_SECRET_KEY: z.string().optional(),

  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // ==========================================================================
  // Optional: Redis (for caching/queue)
  // ==========================================================================
  REDIS_URL: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Parse boolean from string
 */
export function parseBoolean(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true';
}

/**
 * Parse integer from string
 */
export function parseInt(
  value: string | undefined,
  defaultValue: number,
): number {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

// =============================================================================
// Validation Function
// =============================================================================

export const validateEnv = (config: Record<string, unknown>) => {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    console.error('\n❌ Environment validation failed:\n');
    console.error(errors);
    console.error('\n');

    throw new Error(`Environment validation failed. Check the errors above.`);
  }

  // Log warnings for production
  if (config.NODE_ENV === 'production' || config.MODE === 'production') {
    const warnings: string[] = [];

    // Check JWT secret length
    if (
      typeof config.JWT_SECRET === 'string' &&
      config.JWT_SECRET.length < 64
    ) {
      warnings.push(
        'JWT_SECRET should be at least 64 characters in production',
      );
    }

    // Check email configuration
    if (!config.EMAIL_HOST || !config.EMAIL_USER) {
      warnings.push('Email configuration (EMAIL_HOST, EMAIL_USER) is not set');
    }

    // Check AI provider
    const kieEnabled = config.AI_PROVIDER_KIE_ENABLED === 'true';
    const kieKey = config.AI_PROVIDER_KIE_API_KEY;
    if (kieEnabled && !kieKey) {
      warnings.push(
        'AI_PROVIDER_KIE_ENABLED is true but AI_PROVIDER_KIE_API_KEY is not set',
      );
    }

    if (warnings.length > 0) {
      console.warn('\n⚠️  Production Environment Warnings:\n');
      warnings.forEach((w) => console.warn(`  - ${w}`));
      console.warn('\n');
    }
  }

  // Return full config so other env vars remain available
  return config;
};

// =============================================================================
// Helper to get typed env value
// =============================================================================

export const getEnvValue = <K extends keyof EnvConfig>(
  key: K,
  defaultValue?: EnvConfig[K],
): EnvConfig[K] => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value as EnvConfig[K];
};
