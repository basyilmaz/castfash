import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAiProviderConfigDto } from './dto/update-ai-provider-config.dto';

@Injectable()
export class AiProviderConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveConfig(organizationId: number) {
    const orgConfig = await this.prisma.aiProviderConfig.findFirst({
      where: { organizationId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    if (orgConfig) return orgConfig;

    const globalConfig = await this.prisma.aiProviderConfig.findFirst({
      where: { organizationId: null, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    if (globalConfig) return globalConfig;

    return { active: false };
  }

  async upsertOrgConfig(
    organizationId: number,
    dto: UpdateAiProviderConfigDto,
  ) {
    const existing = await this.prisma.aiProviderConfig.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return this.prisma.aiProviderConfig.update({
        where: { id: existing.id },
        data: {
          provider: dto.provider,
          apiKey: dto.apiKey,
          baseUrl: dto.baseUrl,
          modelId: dto.modelId,
          settings: dto.settings,
          isActive: dto.isActive ?? true,
        },
      });
    }

    return this.prisma.aiProviderConfig.create({
      data: {
        organizationId,
        provider: dto.provider,
        apiKey: dto.apiKey,
        baseUrl: dto.baseUrl,
        modelId: dto.modelId,
        settings: dto.settings,
        isActive: dto.isActive ?? true,
      },
    });
  }
}
