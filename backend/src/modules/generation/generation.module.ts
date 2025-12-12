import { Module } from '@nestjs/common';
import { GenerationService } from './generation.service';
import { GenerationController } from './generation.controller';
import { AiImageModule } from '../../ai-image/ai-image.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [AiImageModule, CreditsModule],
  controllers: [GenerationController],
  providers: [GenerationService],
})
export class GenerationModule {}
