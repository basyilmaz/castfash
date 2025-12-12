import { Injectable } from '@nestjs/common';
import { AiProviderType } from '@prisma/client';
import { AiImageGenerateOptions, AiImageProvider } from '../ai-image.types';

@Injectable()
export class ReplicateImageProvider implements AiImageProvider {
  getProviderType(): AiProviderType {
    return AiProviderType.REPLICATE;
  }

  async generateImage(
    _options: AiImageGenerateOptions,
    _organizationId?: number,
  ): Promise<string> {
    throw new Error('Replicate provider not implemented yet');
  }
}
