import { HttpStatus } from '@nestjs/common';

// =============================================================================
// Error Codes - Standardized API Error Codes
// =============================================================================

export const ERROR_CODES = {
  // General Errors (1xxx)
  INTERNAL_ERROR: 'ERR_1000',
  VALIDATION_ERROR: 'ERR_1001',
  NOT_FOUND: 'ERR_1002',
  BAD_REQUEST: 'ERR_1003',
  RATE_LIMITED: 'ERR_1004',
  SERVICE_UNAVAILABLE: 'ERR_1005',

  // Authentication Errors (2xxx)
  UNAUTHORIZED: 'ERR_2000',
  INVALID_CREDENTIALS: 'ERR_2001',
  TOKEN_EXPIRED: 'ERR_2002',
  TOKEN_INVALID: 'ERR_2003',
  FORBIDDEN: 'ERR_2004',
  EMAIL_NOT_VERIFIED: 'ERR_2005',
  ACCOUNT_SUSPENDED: 'ERR_2006',

  // User Errors (3xxx)
  USER_NOT_FOUND: 'ERR_3000',
  USER_EXISTS: 'ERR_3001',
  INVALID_EMAIL: 'ERR_3002',
  WEAK_PASSWORD: 'ERR_3003',
  PASSWORD_MISMATCH: 'ERR_3004',
  RESET_TOKEN_INVALID: 'ERR_3005',
  RESET_TOKEN_EXPIRED: 'ERR_3006',

  // Organization Errors (4xxx)
  ORG_NOT_FOUND: 'ERR_4000',
  ORG_ACCESS_DENIED: 'ERR_4001',
  ORG_MEMBER_EXISTS: 'ERR_4002',
  ORG_OWNER_REQUIRED: 'ERR_4003',

  // Product Errors (5xxx)
  PRODUCT_NOT_FOUND: 'ERR_5000',
  PRODUCT_EXISTS: 'ERR_5001',
  INVALID_PRODUCT_DATA: 'ERR_5002',
  CATEGORY_NOT_FOUND: 'ERR_5003',

  // Model Profile Errors (6xxx)
  MODEL_NOT_FOUND: 'ERR_6000',
  MODEL_EXISTS: 'ERR_6001',
  INVALID_MODEL_DATA: 'ERR_6002',

  // Scene Errors (7xxx)
  SCENE_NOT_FOUND: 'ERR_7000',
  SCENE_PACK_NOT_FOUND: 'ERR_7001',

  // Generation Errors (8xxx)
  GENERATION_FAILED: 'ERR_8000',
  INSUFFICIENT_CREDITS: 'ERR_8001',
  PROVIDER_ERROR: 'ERR_8002',
  PROVIDER_UNAVAILABLE: 'ERR_8003',
  QUEUE_FULL: 'ERR_8004',
  GENERATION_TIMEOUT: 'ERR_8005',
  INVALID_GENERATION_PARAMS: 'ERR_8006',

  // File Upload Errors (9xxx)
  FILE_REQUIRED: 'ERR_9000',
  FILE_TOO_LARGE: 'ERR_9001',
  INVALID_FILE_TYPE: 'ERR_9002',
  FILE_UPLOAD_FAILED: 'ERR_9003',
  MALICIOUS_FILE: 'ERR_9004',

  // Payment Errors (10xxx)
  PAYMENT_FAILED: 'ERR_10000',
  PAYMENT_CANCELLED: 'ERR_10001',
  INVALID_PAYMENT: 'ERR_10002',
  SUBSCRIPTION_REQUIRED: 'ERR_10003',

  // Database Errors (11xxx)
  DATABASE_ERROR: 'ERR_11000',
  DUPLICATE_ENTRY: 'ERR_11001',
  FOREIGN_KEY_ERROR: 'ERR_11002',
  RECORD_NOT_FOUND: 'ERR_11003',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// =============================================================================
// Error Code Mapping
// =============================================================================

const STATUS_TO_CODE: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: ERROR_CODES.BAD_REQUEST,
  [HttpStatus.UNAUTHORIZED]: ERROR_CODES.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ERROR_CODES.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ERROR_CODES.NOT_FOUND,
  [HttpStatus.CONFLICT]: ERROR_CODES.DUPLICATE_ENTRY,
  [HttpStatus.UNPROCESSABLE_ENTITY]: ERROR_CODES.VALIDATION_ERROR,
  [HttpStatus.TOO_MANY_REQUESTS]: ERROR_CODES.RATE_LIMITED,
  [HttpStatus.PAYMENT_REQUIRED]: ERROR_CODES.INSUFFICIENT_CREDITS,
  [HttpStatus.INTERNAL_SERVER_ERROR]: ERROR_CODES.INTERNAL_ERROR,
  [HttpStatus.SERVICE_UNAVAILABLE]: ERROR_CODES.SERVICE_UNAVAILABLE,
};

const EXCEPTION_NAME_TO_CODE: Record<string, string> = {
  BadRequestException: ERROR_CODES.BAD_REQUEST,
  UnauthorizedException: ERROR_CODES.UNAUTHORIZED,
  ForbiddenException: ERROR_CODES.FORBIDDEN,
  NotFoundException: ERROR_CODES.NOT_FOUND,
  ConflictException: ERROR_CODES.DUPLICATE_ENTRY,
  UnprocessableEntityException: ERROR_CODES.VALIDATION_ERROR,
  ThrottlerException: ERROR_CODES.RATE_LIMITED,
  PaymentRequiredException: ERROR_CODES.INSUFFICIENT_CREDITS,
  InternalServerErrorException: ERROR_CODES.INTERNAL_ERROR,
  ServiceUnavailableException: ERROR_CODES.SERVICE_UNAVAILABLE,
  // Custom exceptions
  BusinessException: ERROR_CODES.BAD_REQUEST,
  ResourceNotFoundException: ERROR_CODES.NOT_FOUND,
  ValidationException: ERROR_CODES.VALIDATION_ERROR,
  InsufficientCreditsException: ERROR_CODES.INSUFFICIENT_CREDITS,
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get error code from HTTP status and exception name
 */
export function getErrorCode(status: number, exceptionName?: string): string {
  // First try to match by exception name
  if (exceptionName && EXCEPTION_NAME_TO_CODE[exceptionName]) {
    return EXCEPTION_NAME_TO_CODE[exceptionName];
  }

  // Then try to match by status code
  return STATUS_TO_CODE[status] || ERROR_CODES.INTERNAL_ERROR;
}

/**
 * Error code descriptions (for documentation)
 */
export const ERROR_DESCRIPTIONS: Record<string, string> = {
  [ERROR_CODES.INTERNAL_ERROR]: 'An unexpected server error occurred',
  [ERROR_CODES.VALIDATION_ERROR]: 'Request validation failed',
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found',
  [ERROR_CODES.BAD_REQUEST]: 'The request was invalid or malformed',
  [ERROR_CODES.RATE_LIMITED]: 'Too many requests, please try again later',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable',

  [ERROR_CODES.UNAUTHORIZED]: 'Authentication is required',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Authentication token has expired',
  [ERROR_CODES.TOKEN_INVALID]: 'Authentication token is invalid',
  [ERROR_CODES.FORBIDDEN]: 'You do not have permission to access this resource',
  [ERROR_CODES.EMAIL_NOT_VERIFIED]: 'Email address has not been verified',
  [ERROR_CODES.ACCOUNT_SUSPENDED]: 'This account has been suspended',

  [ERROR_CODES.USER_NOT_FOUND]: 'User not found',
  [ERROR_CODES.USER_EXISTS]: 'A user with this email already exists',
  [ERROR_CODES.INVALID_EMAIL]: 'Invalid email address format',
  [ERROR_CODES.WEAK_PASSWORD]: 'Password does not meet security requirements',
  [ERROR_CODES.PASSWORD_MISMATCH]: 'Passwords do not match',
  [ERROR_CODES.RESET_TOKEN_INVALID]: 'Password reset token is invalid',
  [ERROR_CODES.RESET_TOKEN_EXPIRED]: 'Password reset token has expired',

  [ERROR_CODES.INSUFFICIENT_CREDITS]: 'Insufficient credits for this operation',
  [ERROR_CODES.GENERATION_FAILED]: 'Image generation failed',
  [ERROR_CODES.PROVIDER_ERROR]: 'AI provider returned an error',
  [ERROR_CODES.PROVIDER_UNAVAILABLE]: 'AI provider is currently unavailable',

  [ERROR_CODES.FILE_REQUIRED]: 'A file is required',
  [ERROR_CODES.FILE_TOO_LARGE]: 'File size exceeds the maximum limit',
  [ERROR_CODES.INVALID_FILE_TYPE]: 'File type is not allowed',
  [ERROR_CODES.MALICIOUS_FILE]: 'File appears to contain malicious content',

  [ERROR_CODES.DATABASE_ERROR]: 'A database error occurred',
  [ERROR_CODES.DUPLICATE_ENTRY]: 'A record with this identifier already exists',
};
