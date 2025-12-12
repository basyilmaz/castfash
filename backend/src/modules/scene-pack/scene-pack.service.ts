import { Injectable, NotFoundException } from '@nestjs/common';
import { ScenePreset, SceneType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateScenePackDto } from './dto/create-scene-pack.dto';
import { UpdateScenePackDto } from './dto/update-scene-pack.dto';
import { SCENE_PRESETS } from '../../../prisma/scene-seeds';
import { SCENE_PACKS } from '../../../prisma/scene-pack-seeds';

@Injectable()
export class ScenePackService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.scenePack.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(idOrSlug: string) {
    const pack = await this.prisma.scenePack.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: { scenes: true },
    });
    if (!pack)
      throw new NotFoundException('Resource not found or not accessible');
    return pack;
  }

  create(dto: CreateScenePackDto) {
    return this.prisma.scenePack.create({
      data: {
        ...dto,
        isPublic: dto.isPublic ?? true,
        isPremium: dto.isPremium ?? false,
      },
    });
  }

  async update(id: string, dto: UpdateScenePackDto) {
    await this.findOne(id);
    return this.prisma.scenePack.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.scenePack.delete({ where: { id } });
  }

  async installPackToOrg(packId: string, organizationId: number) {
    const pack = await this.prisma.scenePack.findUnique({
      where: { id: packId },
      include: { scenes: true },
    });
    if (!pack)
      throw new NotFoundException('Resource not found or not accessible');

    let imported = 0;
    let skipped = 0;

    for (const scene of pack.scenes) {
      const exists = await this.prisma.scenePreset.findFirst({
        where: {
          organizationId,
          name: scene.name,
          packId: pack.id,
        },
      });
      if (exists) {
        skipped++;
        continue;
      }
      await this.prisma.scenePreset.create({
        data: {
          organizationId,
          packId: pack.id,
          name: scene.name,
          type: scene.type,
          backgroundReferenceUrl: scene.backgroundReferenceUrl,
          backgroundPrompt: scene.backgroundPrompt,
          lighting: scene.lighting,
          mood: scene.mood,
          suggestedAspectRatio: scene.suggestedAspectRatio,
          qualityPreset: scene.qualityPreset,
          category: scene.category,
          tags: scene.tags,
        },
      });
      imported++;
    }

    return { imported, skipped };
  }

  async seedScenePacks() {
    for (const pack of SCENE_PACKS) {
      const existingPack = await this.prisma.scenePack.findFirst({
        where: { slug: pack.slug },
      });
      const packRecord =
        existingPack ??
        (await this.prisma.scenePack.create({
          data: {
            name: pack.name,
            slug: pack.slug,
            description: pack.description,
            isPublic: pack.isPublic ?? true,
            isPremium: pack.isPremium ?? false,
            category: pack.category,
            tags: pack.tags,
          },
        }));

      // Ensure template scenes (org null) exist and belong to pack
      for (const sceneName of pack.sceneNames) {
        const seedScene = SCENE_PRESETS.find((s) => s.name === sceneName);
        if (!seedScene) continue;

        const existingScene = await this.prisma.scenePreset.findFirst({
          where: {
            organizationId: null,
            name: seedScene.name,
          },
        });

        const sceneRecord: ScenePreset =
          existingScene ??
          (await this.prisma.scenePreset.create({
            data: {
              ...seedScene,
              organizationId: null,
              type: (seedScene.type as SceneType) ?? SceneType.PRESET,
            },
          }));

        if (sceneRecord.packId !== packRecord.id) {
          await this.prisma.scenePreset.update({
            where: { id: sceneRecord.id },
            data: { packId: packRecord.id },
          });
        }
      }
    }
  }
}
