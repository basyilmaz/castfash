import { Module } from '@nestjs/common';
import { ScenesService } from './scenes.service';
import { ScenesController } from './scenes.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AiImageModule } from '../../ai-image/ai-image.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [PrismaModule, AiImageModule, CreditsModule],
  controllers: [ScenesController],
  providers: [ScenesService],
  exports: [ScenesService],
})
export class ScenesModule {}
