import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService, CacheKeys, CacheTTL } from '../../common/cache';

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async getSummary(organizationId: number) {
    const cacheKey = CacheKeys.orgStats(organizationId);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const [productsCount, generatedImagesCount, modelsCount, scenesCount] =
          await Promise.all([
            this.prisma.product.count({ where: { organizationId } }),
            this.prisma.generatedImage.count({
              where: { generationRequest: { organizationId } },
            }),
            this.prisma.modelProfile.count({ where: { organizationId } }),
            this.prisma.scenePreset.count({
              where: {
                OR: [{ organizationId }, { organizationId: null }],
              },
            }),
          ]);

        return {
          productsCount,
          generatedImagesCount,
          modelsCount,
          scenesCount,
        };
      },
      CacheTTL.STATS,
    );
  }

  /**
   * Invalidate stats cache for an organization
   */
  async invalidateOrgStats(organizationId: number): Promise<void> {
    await this.cacheService.del(CacheKeys.orgStats(organizationId));
  }
}
