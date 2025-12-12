import { AiProviderType } from '@prisma/client';

export interface AiImageGenerateOptions {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string;
  resolution?: string;
  imageInputs?: string[];
  qualityMode?: 'FAST' | 'STANDARD' | 'HIGH';
}

export interface AiImageProvider {
  getProviderType(): AiProviderType;
  generateImage(
    options: AiImageGenerateOptions,
    organizationId?: number,
  ): Promise<string>;
}
