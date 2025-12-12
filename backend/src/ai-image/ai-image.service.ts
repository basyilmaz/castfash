import { Injectable, Logger } from '@nestjs/common';
import { AiProviderConfig, AiProviderType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AiImageGenerateOptions, AiImageProvider } from './ai-image.types';
import { KieImageProvider } from './providers/kie-image.provider';
import { ReplicateImageProvider } from './providers/replicate-image.provider';
import { FalImageProvider } from './providers/fal-image.provider';

interface ProviderHealthStats {
  successCount: number;
  errorCount: number;
  avgResponseMs: number;
  lastError: string | null;
  lastErrorAt: Date | null;
}

interface GenerationResult {
  imageUrl: string;
  providerUsed: AiProviderType;
  responseTimeMs: number;
  attemptsCount: number;
  failedProviders: string[];
}

@Injectable()
export class AiImageService {
  private readonly logger = new Logger(AiImageService.name);
  private providers: Map<AiProviderType, AiImageProvider>;
  private enabled: Record<AiProviderType, boolean>;

  constructor(
    private readonly prisma: PrismaService,
    kieProvider: KieImageProvider,
    replicateProvider: ReplicateImageProvider,
    falProvider: FalImageProvider,
  ) {
    this.providers = new Map<AiProviderType, AiImageProvider>([
      [AiProviderType.KIE, kieProvider],
      [AiProviderType.REPLICATE, replicateProvider],
      [AiProviderType.FAL, falProvider],
    ]);
    this.enabled = {
      [AiProviderType.KIE]:
        (process.env.AI_PROVIDER_KIE_ENABLED ?? 'true').toLowerCase() ===
        'true',
      [AiProviderType.REPLICATE]:
        (process.env.AI_PROVIDER_REPLICATE_ENABLED ?? 'false').toLowerCase() ===
        'true',
      [AiProviderType.FAL]:
        (process.env.AI_PROVIDER_FAL_ENABLED ?? 'false').toLowerCase() ===
        'true',
    };
  }

  /**
   * Get all active provider configs sorted by priority
   */
  private async getOrderedProviderConfigs(
    organizationId: number,
  ): Promise<AiProviderConfig[]> {
    // First try organization-specific configs
    const orgConfigs = await this.prisma.aiProviderConfig.findMany({
      where: { organizationId, isActive: true },
      orderBy: { priority: 'asc' },
    });

    if (orgConfigs.length > 0) {
      return orgConfigs;
    }

    // Fallback to global configs
    const globalConfigs = await this.prisma.aiProviderConfig.findMany({
      where: { organizationId: null, isActive: true },
      orderBy: { priority: 'asc' },
    });

    return globalConfigs;
  }

  /**
   * Check if a provider is healthy based on recent error rate
   */
  private isProviderHealthy(config: AiProviderConfig): boolean {
    const totalCalls = config.successCount + config.errorCount;
    if (totalCalls < 5) return true; // Not enough data

    const errorRate = config.errorCount / totalCalls;

    // If error rate > 50% in recent calls, consider unhealthy
    if (errorRate > 0.5) {
      // But if last error was more than 5 minutes ago, try again
      if (config.lastErrorAt) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (config.lastErrorAt < fiveMinutesAgo) {
          return true; // Give it another chance
        }
      }
      return false;
    }

    return true;
  }

  /**
   * Record a successful generation
   */
  private async recordSuccess(
    configId: number,
    responseTimeMs: number,
  ): Promise<void> {
    const config = await this.prisma.aiProviderConfig.findUnique({
      where: { id: configId },
    });

    if (!config) return;

    const newSuccessCount = config.successCount + 1;
    const totalCalls = newSuccessCount + config.errorCount;
    const newAvgResponseMs = config.avgResponseMs
      ? Math.round(
          (config.avgResponseMs * (totalCalls - 1) + responseTimeMs) /
            totalCalls,
        )
      : responseTimeMs;

    await this.prisma.aiProviderConfig.update({
      where: { id: configId },
      data: {
        successCount: newSuccessCount,
        avgResponseMs: newAvgResponseMs,
        // Reset error count gradually on success
        errorCount: Math.max(0, config.errorCount - 1),
      },
    });
  }

  /**
   * Record a failed generation
   */
  private async recordError(
    configId: number,
    errorMessage: string,
  ): Promise<void> {
    await this.prisma.aiProviderConfig.update({
      where: { id: configId },
      data: {
        errorCount: { increment: 1 },
        lastError: errorMessage.slice(0, 500),
        lastErrorAt: new Date(),
      },
    });
  }

  /**
   * Generate image with fallback chain
   */
  async generateForOrganization(
    organizationId: number,
    options: AiImageGenerateOptions,
  ): Promise<string> {
    const result = await this.generateWithFallback(organizationId, options);
    return result.imageUrl;
  }

  /**
   * Generate image with detailed result including fallback information
   */
  async generateWithFallback(
    organizationId: number,
    options: AiImageGenerateOptions,
  ): Promise<GenerationResult> {
    const configs = await this.getOrderedProviderConfigs(organizationId);

    if (configs.length === 0) {
      this.logger.error(
        `No AI provider config found for org ${organizationId}`,
      );
      throw new Error(
        'AI görsel üretimi için yapılandırma bulunamadı. Lütfen sistem yöneticinizle iletişime geçin.',
      );
    }

    const failedProviders: string[] = [];
    let lastError: Error | null = null;
    let attemptsCount = 0;

    // Try each provider in priority order
    for (const config of configs) {
      const provider = this.providers.get(config.provider);

      // Skip if provider not implemented or not enabled
      if (!provider || !this.enabled[config.provider]) {
        this.logger.warn(
          `Provider ${config.provider} is not enabled or not implemented, skipping`,
        );
        continue;
      }

      // Skip if provider is unhealthy
      if (!this.isProviderHealthy(config)) {
        this.logger.warn(
          `Provider ${config.provider} is unhealthy (error count: ${config.errorCount}), skipping`,
        );
        failedProviders.push(`${config.provider} (unhealthy)`);
        continue;
      }

      // Try this provider with retries
      for (let retry = 0; retry < config.maxRetries; retry++) {
        attemptsCount++;
        const startTime = Date.now();

        try {
          this.logger.log(
            `Attempting generation with ${config.provider} (priority: ${config.priority}, attempt: ${retry + 1}/${config.maxRetries})`,
          );

          const imageUrl = await Promise.race([
            provider.generateImage(options, organizationId),
            this.createTimeoutPromise(config.timeoutMs, config.provider),
          ]);

          const responseTimeMs = Date.now() - startTime;

          // Record success
          await this.recordSuccess(config.id, responseTimeMs);

          this.logger.log(
            `Generation succeeded with ${config.provider} in ${responseTimeMs}ms`,
          );

          return {
            imageUrl,
            providerUsed: config.provider,
            responseTimeMs,
            attemptsCount,
            failedProviders,
          };
        } catch (error: any) {
          const responseTimeMs = Date.now() - startTime;
          lastError = error;

          this.logger.error(
            `Generation failed with ${config.provider} (attempt ${retry + 1}): ${error.message}`,
          );

          await this.recordError(config.id, error.message);

          // If it's the last retry for this provider, add to failed list
          if (retry === config.maxRetries - 1) {
            failedProviders.push(
              `${config.provider}: ${error.message.slice(0, 100)}`,
            );
          }

          // Wait before retry (exponential backoff)
          if (retry < config.maxRetries - 1) {
            const waitTime = Math.min(1000 * Math.pow(2, retry), 5000);
            await this.sleep(waitTime);
          }
        }
      }
    }

    // All providers failed
    this.logger.error(
      `All providers failed for org ${organizationId}. Attempts: ${attemptsCount}, Failed: ${failedProviders.join(', ')}`,
    );

    throw new Error(
      `Tüm AI sağlayıcıları başarısız oldu. Denenen: ${failedProviders.join(', ')}. ` +
        `Son hata: ${lastError?.message || 'Bilinmeyen hata'}`,
    );
  }

  /**
   * Get health stats for all providers
   */
  async getProviderHealthStats(): Promise<Record<string, ProviderHealthStats>> {
    const configs = await this.prisma.aiProviderConfig.findMany({
      where: { organizationId: null, isActive: true },
      orderBy: { priority: 'asc' },
    });

    const stats: Record<string, ProviderHealthStats> = {};

    for (const config of configs) {
      stats[config.provider] = {
        successCount: config.successCount,
        errorCount: config.errorCount,
        avgResponseMs: config.avgResponseMs || 0,
        lastError: config.lastError,
        lastErrorAt: config.lastErrorAt,
      };
    }

    return stats;
  }

  /**
   * Reset health stats for a provider
   */
  async resetProviderStats(providerId: number): Promise<void> {
    await this.prisma.aiProviderConfig.update({
      where: { id: providerId },
      data: {
        successCount: 0,
        errorCount: 0,
        avgResponseMs: null,
        lastError: null,
        lastErrorAt: null,
      },
    });
  }

  private createTimeoutPromise(
    timeoutMs: number,
    providerName: string,
  ): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${providerName} timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
