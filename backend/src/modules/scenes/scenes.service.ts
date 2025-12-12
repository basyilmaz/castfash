import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SceneType, AssetType, CreditType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSceneDto } from './dto/create-scene.dto';
import { UpdateSceneDto } from './dto/update-scene.dto';
import { ImportSceneItemDto } from './dto/import-scenes.dto';
import { SCENE_PRESETS } from '../../../prisma/scene-seeds';
import { AiImageService } from '../../ai-image/ai-image.service';
import { CreditsService } from '../credits/credits.service';

@Injectable()
export class ScenesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiImageService: AiImageService,
    private readonly creditsService: CreditsService,
  ) {}

  // ... (existing methods)

  async generateBackground(organizationId: number, id: number, prompt: string) {
    const scene = await this.findOne(organizationId, id);
    const cost = 1;

    // Check credits
    const hasCredits = await this.creditsService.hasEnoughCredits(
      organizationId,
      cost,
    );
    if (!hasCredits) {
      throw new BadRequestException(`Insufficient credits. Required: ${cost}`);
    }

    // Deduct credits
    await this.creditsService.deductCredits({
      organizationId,
      amount: cost,
      type: CreditType.SCENE_GENERATION,
      scenePresetId: id,
      note: `AI Scene Generation - ${scene.name}`,
    });

    try {
      // Generate image
      const imageUrl = await this.aiImageService.generateForOrganization(
        organizationId,
        {
          prompt: `Professional background scene, ${scene.category || ''}, ${scene.mood || ''}, ${scene.lighting || ''}, ${prompt}`,
          aspectRatio: '16:9',
          resolution: '2K',
          qualityMode: 'STANDARD',
        },
      );

      // Update scene
      await this.prisma.scenePreset.update({
        where: { id },
        data: {
          backgroundReferenceUrl: imageUrl,
          backgroundType: AssetType.AI_GENERATED,
          backgroundPrompt: prompt,
          tokensSpentOnCreation: { increment: cost },
        },
      });

      return { imageUrl, tokensUsed: cost };
    } catch (error) {
      // Refund credits on failure
      await this.creditsService.addCredits(
        organizationId,
        cost,
        CreditType.ADJUST,
        `Refund for failed scene generation - ${scene.name}`,
      );
      throw error;
    }
  }

  findAll(organizationId: number, filter?: { category?: string; q?: string }) {
    // ... (rest of the file)
    return this.prisma.scenePreset.findMany({
      where: {
        AND: [
          {
            OR: [{ organizationId }, { organizationId: null }],
          },
          filter?.category ? { category: filter.category } : {},
          filter?.q
            ? {
                OR: [
                  { name: { contains: filter.q, mode: 'insensitive' } },
                  {
                    backgroundPrompt: {
                      contains: filter.q,
                      mode: 'insensitive',
                    },
                  },
                  { tags: { contains: filter.q, mode: 'insensitive' } },
                  { mood: { contains: filter.q, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: number, id: number) {
    const scene = await this.prisma.scenePreset.findFirst({
      where: {
        id,
        OR: [{ organizationId }, { organizationId: null }],
      },
    });
    if (!scene) {
      throw new NotFoundException('Resource not found or not accessible');
    }
    return scene;
  }

  async create(organizationId: number, dto: CreateSceneDto) {
    try {
      return await this.prisma.scenePreset.create({
        data: {
          ...dto,
          type: dto.type ?? SceneType.PRESET,
          organizationId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('A scene with this name already exists.');
      }
      // Temporary: Expose error details for debugging
      throw new BadRequestException(`Create Error: ${error.message}`);
    }
  }

  async update(organizationId: number, id: number, dto: UpdateSceneDto) {
    const existing = await this.prisma.scenePreset.findUnique({
      where: { id },
    });
    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException('Resource not found or not accessible');
    }
    try {
      return await this.prisma.scenePreset.update({
        where: { id },
        data: {
          ...dto,
          type: dto.type ?? SceneType.PRESET,
          organizationId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('A scene with this name already exists.');
      }
      // Temporary: Expose error details for debugging
      throw new BadRequestException(`Update Error: ${error.message}`);
    }
  }

  async seedPresetsForOrg(organizationId: number) {
    const created: any[] = [];
    for (const preset of SCENE_PRESETS) {
      const exists = await this.prisma.scenePreset.findFirst({
        where: {
          organizationId,
          name: preset.name,
        },
      });
      if (exists) continue;
      const scene = await this.prisma.scenePreset.create({
        data: {
          ...preset,
          type: (preset.type as SceneType) ?? SceneType.PRESET,
          organizationId,
        },
      });
      created.push(scene);
    }
    return created;
  }

  async exportScenes(organizationId: number) {
    const scenes = await this.prisma.scenePreset.findMany({
      where: {
        OR: [{ organizationId }, { organizationId: null }],
      },
      orderBy: { createdAt: 'desc' },
    });
    return scenes.map((scene) => ({
      name: scene.name,
      description: (scene as any).description ?? undefined,
      type: scene.type,
      backgroundReferenceUrl: scene.backgroundReferenceUrl ?? undefined,
      backgroundPrompt: scene.backgroundPrompt ?? undefined,
      lighting: scene.lighting ?? undefined,
      mood: scene.mood ?? undefined,
      suggestedAspectRatio: scene.suggestedAspectRatio ?? undefined,
      qualityPreset: scene.qualityPreset ?? undefined,
      category: scene.category ?? undefined,
      tags: scene.tags ?? undefined,
    }));
  }

  async importScenes(
    scenes: ImportSceneItemDto[],
    organizationId: number,
  ): Promise<{ imported: number; skipped: number }> {
    let imported = 0;
    let skipped = 0;
    for (const item of scenes) {
      const exists = await this.prisma.scenePreset.findFirst({
        where: {
          organizationId,
          name: item.name,
        },
      });
      if (exists) {
        skipped++;
        continue;
      }
      await this.prisma.scenePreset.create({
        data: {
          organizationId,
          name: item.name,
          type: (item.type as SceneType) ?? SceneType.PRESET,
          backgroundReferenceUrl: item.backgroundReferenceUrl,
          backgroundPrompt: item.backgroundPrompt,
          lighting: item.lighting,
          mood: item.mood,
          suggestedAspectRatio: item.suggestedAspectRatio,
          qualityPreset: item.qualityPreset,
          category: item.category,
          tags: item.tags,
        },
      });
      imported++;
    }
    return { imported, skipped };
  }
}
