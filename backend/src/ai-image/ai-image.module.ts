import { Module } from '@nestjs/common';
import { AiImageService } from './ai-image.service';
import { PrismaModule } from '../prisma/prisma.module';
import { KieImageProvider } from './providers/kie-image.provider';
import { ReplicateImageProvider } from './providers/replicate-image.provider';
import { FalImageProvider } from './providers/fal-image.provider';

@Module({
  imports: [PrismaModule],
  providers: [
    AiImageService,
    KieImageProvider,
    ReplicateImageProvider,
    FalImageProvider,
  ],
  exports: [AiImageService],
})
export class AiImageModule {}
