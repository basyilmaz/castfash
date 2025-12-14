/**
 * Frontend Environment Validation
 * 
 * Validates required environment variables at build time and runtime
 */

interface EnvConfig {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_APP_NAME: string;
    NEXT_PUBLIC_APP_URL: string;
}

interface EnvValidationResult {
    valid: boolean;
    errors: string[];
    config: Partial<EnvConfig>;
}

/**
 * Default values for optional environment variables
 */
const defaults: Partial<EnvConfig> = {
    NEXT_PUBLIC_APP_NAME: 'CastFash',
    NEXT_PUBLIC_API_URL: 'http://localhost:3002',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3003',
};

/**
 * Required environment variables
 */
const requiredVars: (keyof EnvConfig)[] = [
    'NEXT_PUBLIC_API_URL',
];

/**
 * Validate environment configuration
 */
export function validateEnv(): EnvValidationResult {
    const errors: string[] = [];
    const config: Partial<EnvConfig> = {};

    // Check required variables
    for (const key of requiredVars) {
        const value = process.env[key];
        if (!value && !defaults[key]) {
            errors.push(`Missing required environment variable: ${key}`);
        } else {
            config[key] = value || defaults[key]!;
        }
    }

    // Apply defaults for optional variables
    for (const [key, defaultValue] of Object.entries(defaults)) {
        const envKey = key as keyof EnvConfig;
        if (!config[envKey]) {
            config[envKey] = process.env[key] || defaultValue;
        }
    }

    // Validate URL formats
    if (config.NEXT_PUBLIC_API_URL && !isValidUrl(config.NEXT_PUBLIC_API_URL)) {
        errors.push(`Invalid URL format for NEXT_PUBLIC_API_URL: ${config.NEXT_PUBLIC_API_URL}`);
    }
    if (config.NEXT_PUBLIC_APP_URL && !isValidUrl(config.NEXT_PUBLIC_APP_URL)) {
        errors.push(`Invalid URL format for NEXT_PUBLIC_APP_URL: ${config.NEXT_PUBLIC_APP_URL}`);
    }

    return {
        valid: errors.length === 0,
        errors,
        config,
    };
}

/**
 * Validate URL format
 */
function isValidUrl(urlString: string): boolean {
    try {
        new URL(urlString);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get validated environment configuration
 * Throws an error if validation fails
 */
export function getEnvConfig(): EnvConfig {
    const result = validateEnv();

    if (!result.valid) {
        const errorMessage = [
            '❌ Environment validation failed:',
            ...result.errors.map((e) => `  • ${e}`),
            '',
            'Please check your .env.local file and ensure all required variables are set.',
        ].join('\n');

        if (typeof window === 'undefined') {
            // Server-side: log error
            console.error(errorMessage);
        }

        // In development, throw error. In production, use defaults.
        if (process.env.NODE_ENV === 'development') {
            throw new Error(errorMessage);
        }
    }

    return result.config as EnvConfig;
}

/**
 * Environment configuration singleton
 */
let envConfig: EnvConfig | null = null;

/**
 * Get environment configuration (cached)
 */
export function env(): EnvConfig {
    if (!envConfig) {
        envConfig = getEnvConfig();
    }
    return envConfig;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
}

/**
 * Check if running on server
 */
export function isServer(): boolean {
    return typeof window === 'undefined';
}

/**
 * Check if running on client
 */
export function isClient(): boolean {
    return typeof window !== 'undefined';
}

// Export environment variables for easy access
export const API_URL = process.env.NEXT_PUBLIC_API_URL || defaults.NEXT_PUBLIC_API_URL!;
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || defaults.NEXT_PUBLIC_APP_NAME!;
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || defaults.NEXT_PUBLIC_APP_URL!;
