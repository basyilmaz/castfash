import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLogger } from '../logger/app-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // Get user info if authenticated
    const userId = request.user?.sub || request.user?.id;
    const organizationId = request.user?.organizationId;

    // Generate request ID
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    request.requestId = requestId;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Log successful requests
          this.logger.logRequest(method, url, statusCode, duration, {
            requestId,
            userId,
            organizationId,
            ip: this.getClientIp(request),
            userAgent: userAgent.substring(0, 100), // Truncate long user agents
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || error.statusCode || 500;

          // Log error requests
          this.logger.logRequest(method, url, statusCode, duration, {
            requestId,
            userId,
            organizationId,
            ip: this.getClientIp(request),
            error: error.message,
          });
        },
      }),
    );
  }

  private getClientIp(request: any): string {
    return (
      request.ip ||
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.connection?.remoteAddress ||
      'unknown'
    );
  }
}
