import { z } from 'zod';

export const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(
      (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
      'DATABASE_URL must be a valid PostgreSQL connection string',
    ),

  // JWT Configuration
  JWT_SECRET: z
    .string()
    .min(8, 'JWT_SECRET must be at least 8 characters')
    .refine(
      (secret) => {
        if (secret.length < 32) {
          console.warn(
            '⚠️  WARNING: JWT_SECRET should be at least 32 characters for production security',
          );
        }
        return true;
      },
      { message: 'JWT_SECRET validation' },
    ),
  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .min(1, 'JWT_ACCESS_EXPIRES_IN is required (e.g., "7d", "24h")')
    .default('7d'),

  // Server Configuration
  PORT: z
    .string()
    .optional()
    .default('3002')
    .transform((val) => val || '3002'),
  MODE: z.enum(['development', 'production']).default('development').optional(),

  // AI Provider Settings (Optional)
  AI_PROVIDER_KIE_ENABLED: z
    .string()
    .optional()
    .default('true')
    .transform((val) => val?.toLowerCase() === 'true'),
  AI_PROVIDER_REPLICATE_ENABLED: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val?.toLowerCase() === 'true'),
  AI_PROVIDER_FAL_ENABLED: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val?.toLowerCase() === 'true'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export const validateEnv = (config: Record<string, unknown>) => {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Environment validation error: ${message}`);
  }
  // return full config so other env vars remain available
  return config;
};
