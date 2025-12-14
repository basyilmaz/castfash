import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ERROR_CODES, getErrorCode } from './error-codes';

// =============================================================================
// Standard API Response Format
// =============================================================================

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
    path: string;
    requestId?: string;
    details?: unknown;
  };
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// =============================================================================
// Global Exception Filter
// =============================================================================

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Generate request ID for tracing
    const requestId = (request.headers['x-request-id'] as string) ||
      `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let errorCode: string = ERROR_CODES.INTERNAL_ERROR;
    let details: unknown = undefined;

    // Handle HttpException (NestJS standard exceptions)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;

        // Handle validation errors (class-validator)
        if (Array.isArray(responseObj.message)) {
          message = (responseObj.message as string[]).join('; ');
        } else {
          message = (responseObj.message as string) || message;
        }

        details = responseObj.details;

        // Use custom error code if provided
        if (responseObj.code) {
          errorCode = responseObj.code as string;
        }
      }

      // Map status to error code if not custom
      if (!errorCode || errorCode === ERROR_CODES.INTERNAL_ERROR) {
        errorCode = getErrorCode(status, exception.name);
      }
    }
    // Handle standard Error
    else if (exception instanceof Error) {
      message = this.sanitizeErrorMessage(exception.message);

      // Log full stack for debugging
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );

      // Check for specific error types
      if (exception.name === 'PrismaClientKnownRequestError') {
        status = HttpStatus.BAD_REQUEST;
        errorCode = ERROR_CODES.DATABASE_ERROR;
        message = this.handlePrismaError(exception);
      } else if (exception.name === 'PrismaClientValidationError') {
        status = HttpStatus.BAD_REQUEST;
        errorCode = ERROR_CODES.VALIDATION_ERROR;
        message = 'Invalid data format';
      }
    }
    // Unknown error type
    else {
      this.logger.error('Unknown error type', JSON.stringify(exception));
    }

    // Build error response
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId,
      },
    };

    // Include details in development mode
    if (this.isDevelopment() && details) {
      errorResponse.error.details = details;
    }

    // Add stack trace in development for 500 errors
    if (this.isDevelopment() && status >= 500 && exception instanceof Error) {
      errorResponse.error.details = {
        ...(typeof details === 'object' ? details : {}),
        stack: exception.stack?.split('\n').slice(0, 5),
      };
    }

    // Log based on severity
    this.logError(request, status, message, errorCode, exception);

    // Set response headers
    response.setHeader('X-Request-Id', requestId);
    response.status(status).json(errorResponse);
  }

  private isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development' ||
      process.env.MODE === 'development';
  }

  private sanitizeErrorMessage(message: string): string {
    // Don't expose internal error details in production
    if (!this.isDevelopment()) {
      // Hide database/internal details
      if (message.includes('prisma') || message.includes('database')) {
        return 'A database error occurred';
      }
      if (message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT')) {
        return 'Service temporarily unavailable';
      }
    }
    return message;
  }

  private handlePrismaError(error: Error): string {
    const message = error.message;

    // Unique constraint violation
    if (message.includes('Unique constraint')) {
      const match = message.match(/constraint failed on the fields: \(`([^`]+)`\)/);
      const field = match ? match[1] : 'field';
      return `A record with this ${field} already exists`;
    }

    // Foreign key constraint
    if (message.includes('Foreign key constraint')) {
      return 'Referenced record does not exist';
    }

    // Record not found
    if (message.includes('Record to update not found') ||
      message.includes('Record to delete does not exist')) {
      return 'Record not found';
    }

    return 'Database operation failed';
  }

  private logError(
    request: Request,
    status: number,
    message: string,
    errorCode: string,
    exception: unknown,
  ): void {
    const logMessage = `${request.method} ${request.url} [${status}] ${errorCode}: ${message}`;

    if (status >= 500) {
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (status >= 400) {
      this.logger.warn(logMessage);
    } else {
      this.logger.log(logMessage);
    }
  }
}

// =============================================================================
// Response Helper Functions
// =============================================================================

export function createSuccessResponse<T>(
  data: T,
  meta?: ApiSuccessResponse['meta'],
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): ApiSuccessResponse<T[]> {
  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
