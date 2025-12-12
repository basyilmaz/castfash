import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SceneType } from '@prisma/client';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureProductCategories();
    await this.ensureGlobalScenes();
  }

  async ensureProductCategories() {
    const categories = ['bikini', 'dress', 'tshirt'];
    await Promise.all(
      categories.map((name) =>
        this.prisma.productCategory.upsert({
          where: { name },
          update: {},
          create: { name },
        }),
      ),
    );
    this.logger.log('Default product categories ensured.');
  }

  private async ensureGlobalScenes() {
    const scenes = [
      {
        name: 'Beach',
        type: SceneType.PRESET,
        backgroundReferenceUrl: 'https://picsum.photos/seed/beach/1080/1920',
      },
      {
        name: 'White Studio',
        type: SceneType.PRESET,
        backgroundReferenceUrl: 'https://picsum.photos/seed/studio/1080/1920',
      },
      {
        name: 'Soft Pink',
        type: SceneType.SOLID_COLOR,
        solidColorHex: '#fce4ec',
      },
    ];

    for (const scene of scenes) {
      const exists = await this.prisma.scenePreset.findFirst({
        where: { name: scene.name, organizationId: null },
      });
      if (!exists) {
        await this.prisma.scenePreset.create({
          data: { ...scene, organizationId: null },
        });
      }
    }
    this.logger.log('Global scenes ensured.');
  }
}
