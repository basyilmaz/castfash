import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(organizationId: number) {
    const [productsCount, generatedImagesCount] = await Promise.all([
      this.prisma.product.count({ where: { organizationId } }),
      this.prisma.generatedImage.count({
        where: { generationRequest: { organizationId } },
      }),
    ]);

    return {
      productsCount,
      generatedImagesCount,
    };
  }
}
