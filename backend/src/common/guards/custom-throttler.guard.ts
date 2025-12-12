import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

/**
 * Custom throttler guard that supports different rate limits for different endpoints
 * Uses @Throttle() decorator or falls back to global settings
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    // Skip throttling for health checks
    const request = context.switchToHttp().getRequest();
    if (request.url === '/health' || request.url === '/api/health') {
      return true;
    }
    return false;
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use user ID if authenticated, otherwise use IP
    const userId = req.user?.sub || req.user?.id;
    if (userId) {
      return `user_${userId}`;
    }

    // Get IP from various sources
    const ip =
      req.ip ||
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection?.remoteAddress ||
      'unknown';
    return `ip_${ip}`;
  }

  protected throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.',
    );
  }
}
