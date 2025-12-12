import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string, statusCode = HttpStatus.BAD_REQUEST) {
    super(message, statusCode);
    this.name = 'BusinessException';
  }
}

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id?: number | string) {
    const message = id
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(message, HttpStatus.NOT_FOUND);
    this.name = 'ResourceNotFoundException';
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized access') {
    super(message, HttpStatus.UNAUTHORIZED);
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Access forbidden') {
    super(message, HttpStatus.FORBIDDEN);
    this.name = 'ForbiddenException';
  }
}

export class ValidationException extends HttpException {
  constructor(message: string, details?: unknown) {
    super(
      {
        message,
        error: 'ValidationException',
        details,
      },
      HttpStatus.BAD_REQUEST,
    );
    this.name = 'ValidationException';
  }
}

export class InsufficientCreditsException extends HttpException {
  constructor(required: number, available: number) {
    super(
      {
        message: `Insufficient credits. Required: ${required}, Available: ${available}`,
        error: 'InsufficientCreditsException',
        details: { required, available },
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
    this.name = 'InsufficientCreditsException';
  }
}
