import { toast } from './toast';

/**
 * API Error types
 */
export enum ApiErrorCode {
    NETWORK_ERROR = 'NETWORK_ERROR',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    TIMEOUT = 'TIMEOUT',
    UNKNOWN = 'UNKNOWN',
}

export interface ApiError {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown> | Array<{ field?: string; property?: string; message: string }>;
    statusCode?: number;
}

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
    [ApiErrorCode.NETWORK_ERROR]: 'İnternet bağlantınızı kontrol edin',
    [ApiErrorCode.UNAUTHORIZED]: 'Oturum süreniz doldu. Lütfen tekrar giriş yapın',
    [ApiErrorCode.FORBIDDEN]: 'Bu işlem için yetkiniz yok',
    [ApiErrorCode.NOT_FOUND]: 'İstediğiniz kaynak bulunamadı',
    [ApiErrorCode.VALIDATION_ERROR]: 'Girdiğiniz bilgileri kontrol edin',
    [ApiErrorCode.SERVER_ERROR]: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin',
    [ApiErrorCode.TIMEOUT]: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin',
    [ApiErrorCode.UNKNOWN]: 'Beklenmeyen bir hata oluştu',
};

/**
 * Parse error from API response
 */
export function parseApiError(error: unknown): ApiError {
    const err = error as { response?: { status?: number; data?: { message?: string; errors?: unknown; details?: unknown } } };
    // Network error
    if (!err.response) {
        return {
            code: ApiErrorCode.NETWORK_ERROR,
            message: ERROR_MESSAGES[ApiErrorCode.NETWORK_ERROR],
        };
    }

    const statusCode = err.response?.status;
    const data = err.response?.data;

    // Map status code to error code
    let code: ApiErrorCode;
    switch (statusCode) {
        case 401:
            code = ApiErrorCode.UNAUTHORIZED;
            break;
        case 403:
            code = ApiErrorCode.FORBIDDEN;
            break;
        case 404:
            code = ApiErrorCode.NOT_FOUND;
            break;
        case 422:
        case 400:
            code = ApiErrorCode.VALIDATION_ERROR;
            break;
        case 500:
        case 502:
        case 503:
            code = ApiErrorCode.SERVER_ERROR;
            break;
        case 408:
            code = ApiErrorCode.TIMEOUT;
            break;
        default:
            code = ApiErrorCode.UNKNOWN;
    }

    return {
        code,
        message: data?.message || ERROR_MESSAGES[code],
        details: (data?.errors || data?.details) as ApiError['details'],
        statusCode,
    };
}

/**
 * Handle API error with toast notification
 */
export function handleApiError(error: unknown, customMessage?: string): ApiError {
    const apiError = parseApiError(error);

    // Show toast notification
    toast.error(
        customMessage || apiError.message,
        apiError.details ? JSON.stringify(apiError.details) : undefined
    );

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', apiError);
    }

    // Handle specific error codes
    if (apiError.code === ApiErrorCode.UNAUTHORIZED) {
        // Redirect to login after a delay
        setTimeout(() => {
            window.location.href = '/auth/login';
        }, 2000);
    }

    return apiError;
}

/**
 * Retry mechanism for failed requests
 */
export async function retryRequest<T>(
    requestFn: () => Promise<T>,
    options: {
        maxRetries?: number;
        retryDelay?: number;
        onRetry?: (attempt: number) => void;
    } = {}
): Promise<T> {
    const { maxRetries = 3, retryDelay = 1000, onRetry } = options;

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await requestFn();
        } catch (error) {
            lastError = error;

            const apiError = parseApiError(error);

            // Don't retry on certain errors
            if (
                apiError.code === ApiErrorCode.UNAUTHORIZED ||
                apiError.code === ApiErrorCode.FORBIDDEN ||
                apiError.code === ApiErrorCode.VALIDATION_ERROR
            ) {
                throw error;
            }

            // Last attempt
            if (attempt === maxRetries) {
                throw error;
            }

            // Notify retry
            if (onRetry) {
                onRetry(attempt);
            }

            // Wait before retry with exponential backoff
            await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
        }
    }

    throw lastError;
}

/**
 * Validation error helper
 */
export function getValidationErrors(error: ApiError): Record<string, string> | null {
    if (error.code !== ApiErrorCode.VALIDATION_ERROR || !error.details) {
        return null;
    }

    // Handle different validation error formats
    if (Array.isArray(error.details)) {
        return error.details.reduce((acc, err) => {
            const key = err.field ?? err.property ?? 'unknown';
            acc[key] = err.message;
            return acc;
        }, {} as Record<string, string>);
    }

    if (typeof error.details === 'object') {
        // Convert Record<string, unknown> to Record<string, string>
        const result: Record<string, string> = {};
        for (const [key, value] of Object.entries(error.details)) {
            result[key] = String(value);
        }
        return result;
    }

    return null;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
    return (
        error.code === ApiErrorCode.NETWORK_ERROR ||
        error.code === ApiErrorCode.TIMEOUT ||
        error.code === ApiErrorCode.SERVER_ERROR
    );
}

/**
 * Format error for logging/monitoring
 */
export function formatErrorForLogging(error: ApiError, context?: Record<string, unknown>): object {
    return {
        timestamp: new Date().toISOString(),
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
        context,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
}
