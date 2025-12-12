import { Module } from '@nestjs/common';
import { ModelProfilesService } from './model-profiles.service';
import { ModelProfilesController } from './model-profiles.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AiImageModule } from '../../ai-image/ai-image.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [PrismaModule, AiImageModule, CreditsModule],
  controllers: [ModelProfilesController],
  providers: [ModelProfilesService],
  exports: [ModelProfilesService],
})
export class ModelProfilesModule {}
