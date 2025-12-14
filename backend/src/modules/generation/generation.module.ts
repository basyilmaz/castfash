import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GenerationService } from './generation.service';
import { GenerationController } from './generation.controller';
import { GenerationGateway } from '../../generation/generation.gateway';
import { AiImageModule } from '../../ai-image/ai-image.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [
    AiImageModule,
    CreditsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [GenerationController],
  providers: [GenerationService, GenerationGateway],
  exports: [GenerationService, GenerationGateway],
})
export class GenerationModule {}
