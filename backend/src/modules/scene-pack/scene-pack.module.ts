import { Module } from '@nestjs/common';
import { ScenePackService } from './scene-pack.service';
import { ScenePackController } from './scene-pack.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ScenePackController],
  providers: [ScenePackService, PrismaService],
  exports: [ScenePackService],
})
export class ScenePackModule {}
