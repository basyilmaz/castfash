import { Injectable } from '@nestjs/common';
import { AiProviderType } from '@prisma/client';
import { AiImageGenerateOptions, AiImageProvider } from '../ai-image.types';

@Injectable()
export class FalImageProvider implements AiImageProvider {
  getProviderType(): AiProviderType {
    return AiProviderType.FAL;
  }

  async generateImage(
    _options: AiImageGenerateOptions,
    _organizationId?: number,
  ): Promise<string> {
    throw new Error('Fal.ai provider not implemented yet');
  }
}
