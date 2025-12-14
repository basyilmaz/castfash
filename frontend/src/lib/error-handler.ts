/**
 * Frontend Error Handler
 * 
 * Centralized error handling for API responses and application errors
 */

import { toast } from 'sonner';

/**
 * Standard API Error Response format
 */
export interface ApiErrorResponse {
    statusCode: number;
    message: string | string[];
    error?: string;
    code?: string;
    timestamp?: string;
    path?: string;
}

/**
 * Error codes mapping (matches backend error-codes.ts)
 */
export const ERROR_CODES = {
    // Authentication Errors (AUTH_xxx)
    AUTH_INVALID_CREDENTIALS: 'Geçersiz kullanıcı adı veya şifre',
    AUTH_TOKEN_EXPIRED: 'Oturum süresi doldu. Lütfen tekrar giriş yapın',
    AUTH_TOKEN_INVALID: 'Geçersiz oturum. Lütfen tekrar giriş yapın',
    AUTH_UNAUTHORIZED: 'Bu işlem için yetkiniz yok',
    AUTH_EMAIL_EXISTS: 'Bu e-posta adresi zaten kayıtlı',
    AUTH_WEAK_PASSWORD: 'Şifre yeterince güçlü değil',

    // Resource Errors (RESOURCE_xxx)
    RESOURCE_NOT_FOUND: 'İstenen kaynak bulunamadı',
    RESOURCE_FORBIDDEN: 'Bu kaynağa erişim izniniz yok',
    RESOURCE_CONFLICT: 'Kaynak çakışması - bu kaynak zaten mevcut',

    // Validation Errors (VALIDATION_xxx)
    VALIDATION_FAILED: 'Girilen bilgiler geçersiz',
    VALIDATION_REQUIRED_FIELD: 'Zorunlu alan eksik',
    VALIDATION_INVALID_FORMAT: 'Geçersiz format',

    // Credit Errors (CREDITS_xxx)
    CREDITS_INSUFFICIENT: 'Yetersiz kredi. Lütfen kredi satın alın',
    CREDITS_INVALID_AMOUNT: 'Geçersiz kredi miktarı',

    // Generation Errors (GENERATION_xxx)
    GENERATION_FAILED: 'Görsel oluşturma başarısız oldu',
    GENERATION_PROVIDER_ERROR: 'AI sağlayıcı hatası. Lütfen tekrar deneyin',
    GENERATION_TIMEOUT: 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin',

    // Upload Errors (UPLOAD_xxx)
    UPLOAD_FILE_TOO_LARGE: 'Dosya çok büyük. Maksimum 10MB yükleyebilirsiniz',
    UPLOAD_INVALID_TYPE: 'Geçersiz dosya türü. Sadece JPG, PNG, WEBP desteklenir',
    UPLOAD_FAILED: 'Dosya yükleme başarısız oldu',

    // Rate Limit Errors
    RATE_LIMIT_EXCEEDED: 'Çok fazla istek. Lütfen biraz bekleyin',

    // Server Errors
    INTERNAL_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin',
    SERVICE_UNAVAILABLE: 'Servis şu anda kullanılamıyor',
} as const;

/**
 * Get user-friendly error message from error code
 */
export function getErrorMessage(code?: string, fallback?: string): string {
    if (code && code in ERROR_CODES) {
        return ERROR_CODES[code as keyof typeof ERROR_CODES];
    }
    return fallback || 'Beklenmeyen bir hata oluştu';
}

/**
 * Parse API error response
 */
export function parseApiError(error: any): ApiErrorResponse {
    // Axios error
    if (error?.response?.data) {
        const data = error.response.data;
        return {
            statusCode: error.response.status,
            message: data.message || 'Bilinmeyen hata',
            error: data.error,
            code: data.code,
        };
    }

    // Fetch error
    if (error?.status) {
        return {
            statusCode: error.status,
            message: error.statusText || 'Bilinmeyen hata',
        };
    }

    // Network error
    if (error?.message === 'Network Error' || error?.name === 'TypeError') {
        return {
            statusCode: 0,
            message: 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin',
            error: 'Network Error',
        };
    }

    // Unknown error
    return {
        statusCode: 500,
        message: error?.message || 'Beklenmeyen bir hata oluştu',
        error: 'Unknown Error',
    };
}

/**
 * Handle API error with toast notification
 */
export function handleApiError(error: any, options?: {
    showToast?: boolean;
    customMessage?: string;
    duration?: number;
}): ApiErrorResponse {
    const { showToast = true, customMessage, duration = 5000 } = options || {};

    const parsedError = parseApiError(error);

    // Get user-friendly message
    const message = customMessage ||
        getErrorMessage(parsedError.code) ||
        (Array.isArray(parsedError.message)
            ? parsedError.message.join(', ')
            : parsedError.message);

    // Show toast notification
    if (showToast) {
        toast.error(message, { duration });
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('[API Error]', {
            status: parsedError.statusCode,
            message: parsedError.message,
            code: parsedError.code,
            originalError: error,
        });
    }

    return parsedError;
}

/**
 * Handle success with toast notification
 */
export function handleSuccess(message: string, options?: { duration?: number }): void {
    toast.success(message, { duration: options?.duration || 3000 });
}

/**
 * Handle warning with toast notification
 */
export function handleWarning(message: string, options?: { duration?: number }): void {
    toast.warning(message, { duration: options?.duration || 4000 });
}

/**
 * Handle info with toast notification
 */
export function handleInfo(message: string, options?: { duration?: number }): void {
    toast.info(message, { duration: options?.duration || 3000 });
}

/**
 * Error boundary helper for async operations
 */
export async function withErrorHandling<T>(
    operation: () => Promise<T>,
    options?: {
        onError?: (error: ApiErrorResponse) => void;
        showToast?: boolean;
        fallback?: T;
    }
): Promise<T | undefined> {
    try {
        return await operation();
    } catch (error) {
        const parsedError = handleApiError(error, { showToast: options?.showToast ?? true });
        options?.onError?.(parsedError);
        return options?.fallback;
    }
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: ApiErrorResponse): boolean {
    return error.statusCode === 401 ||
        error.code?.startsWith('AUTH_') === true;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: ApiErrorResponse): boolean {
    return error.statusCode === 400 ||
        error.code?.startsWith('VALIDATION_') === true;
}

/**
 * Check if error is a credits error
 */
export function isCreditsError(error: ApiErrorResponse): boolean {
    return error.code?.startsWith('CREDITS_') === true;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: ApiErrorResponse): boolean {
    return error.statusCode === 429 ||
        error.code === 'RATE_LIMIT_EXCEEDED';
}

/**
 * Retry failed operation with exponential backoff
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    options?: {
        maxRetries?: number;
        baseDelay?: number;
        maxDelay?: number;
        shouldRetry?: (error: any) => boolean;
    }
): Promise<T> {
    const {
        maxRetries = 3,
        baseDelay = 1000,
        maxDelay = 10000,
        shouldRetry = (error: unknown) => !isAuthError(parseApiError(error))
    } = options || {};

    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            if (attempt === maxRetries || !shouldRetry(error)) {
                throw error;
            }

            const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}
