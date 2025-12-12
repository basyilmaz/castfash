import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GenerateRequestDto } from './dto/generate-request.dto';
import { CreditType, GenerationStatus, ViewType, Prisma } from '@prisma/client';
import { AiImageService } from '../../ai-image/ai-image.service';
import { CreditsService } from '../credits/credits.service';
import { buildPrompts } from '../../generation/prompt-builder';
import {
  BatchGenerateDto,
  BatchGenerateResponse,
  BatchGenerationJobResult,
} from './dto/batch-generate.dto';

@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiImageService: AiImageService,
    private readonly creditsService: CreditsService,
  ) { }

  /**
   * Get token cost per image based on quality mode
   * FAST: 3 tokens (quick, standard quality)
   * STANDARD: 5 tokens (balanced, good quality)
   * HIGH: 8 tokens (slow, best quality)
   */
  private getTokenCostPerImage(qualityMode: string): number {
    switch (qualityMode) {
      case 'FAST':
        return 3;
      case 'STANDARD':
        return 5;
      case 'HIGH':
        return 8;
      default:
        return 5; // Default to STANDARD
    }
  }

  async generate(
    organizationId: number,
    productId: number,
    dto: GenerateRequestDto,
  ) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, organizationId },
    });
    if (!product)
      throw new NotFoundException('Resource not found or not accessible');

    const totalCount = (dto.frontCount ?? 0) + (dto.backCount ?? 0);
    if (totalCount <= 0) {
      throw new BadRequestException(
        'At least one front or back image must be requested',
      );
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization)
      throw new NotFoundException('Resource not found or not accessible');

    // Quality-based token pricing for final generation
    const qualityMode = dto.qualityMode ?? 'STANDARD';
    const tokensPerImage = this.getTokenCostPerImage(qualityMode);
    const totalCreditsNeeded = totalCount * tokensPerImage;

    // Check if organization has enough credits
    const hasEnough = await this.creditsService.hasEnoughCredits(
      organizationId,
      totalCreditsNeeded,
    );
    if (!hasEnough) {
      const balance = await this.creditsService.getBalance(organizationId);
      throw new BadRequestException(
        `Not enough credits. Required: ${totalCreditsNeeded} (${totalCount} images × ${tokensPerImage} tokens/${qualityMode}), Available: ${balance}`,
      );
    }

    const profile = await this.prisma.modelProfile.findFirst({
      where: { id: dto.modelProfileId, organizationId },
    });
    if (!profile)
      throw new NotFoundException('Resource not found or not accessible');

    const scene = await this.prisma.scenePreset.findFirst({
      where: {
        id: dto.scenePresetId,
        OR: [{ organizationId }, { organizationId: null }],
      },
    });
    if (!scene)
      throw new NotFoundException('Resource not found or not accessible');

    const aspectRatio = dto.aspectRatio ?? '9:16';
    const resolution = dto.resolution ?? '4K';
    // qualityMode already defined above (line 71)
    const imageInputs = [
      profile?.faceReferenceUrl,
      profile?.backReferenceUrl,
      product.productImageUrl,
      (product as any).productBackImageUrl,
      scene?.backgroundReferenceUrl,
    ].filter((val): val is string => Boolean(val));

    const prompts = buildPrompts(
      product,
      profile,
      scene,
      {
        front: dto.customPromptFront,
        back: dto.customPromptBack,
      },
      {
        cameraAngle: dto.cameraAngle,
        shotType: dto.shotType,
        modelPose: dto.modelPose,
      },
    );

    if (dto.overridePromptFront) {
      prompts.front = { fullPrompt: dto.overridePromptFront };
    }
    if (dto.overridePromptBack) {
      prompts.back = { fullPrompt: dto.overridePromptBack };
    }

    this.logger.log(
      `Generation request org=${organizationId} product=${productId} model=${dto.modelProfileId} scene=${dto.scenePresetId} front=${dto.frontCount} back=${dto.backCount} aspect=${aspectRatio} res=${resolution} quality=${qualityMode}`,
    );
    this.logger.debug(
      `Prompt availability: front=${prompts.front?.fullPrompt ? 'ok' : 'missing'} back=${prompts.back?.fullPrompt ? 'ok' : 'missing'}`,
    );

    if (dto.frontCount > 0 && !prompts.front?.fullPrompt) {
      throw new BadRequestException(
        'Front generation requested but front prompt cannot be built',
      );
    }
    if (dto.backCount > 0 && !prompts.back?.fullPrompt) {
      throw new BadRequestException(
        'Back generation requested but back prompt cannot be built',
      );
    }

    const generatedUrls: {
      viewType: ViewType;
      indexNumber: number;
      url: string;
    }[] = [];
    const errors: { front?: string; back?: string } = {};
    const seed = Date.now();

    if (dto.frontCount > 0 && prompts.front?.fullPrompt) {
      this.logger.debug(
        `Generating FRONT images: count=${dto.frontCount}, aspect=${aspectRatio}, quality=${qualityMode}, promptLen=${prompts.front.fullPrompt.length}`,
      );
    }
    if (dto.backCount > 0 && prompts.back?.fullPrompt) {
      this.logger.debug(
        `Generating BACK images: count=${dto.backCount}, aspect=${aspectRatio}, quality=${qualityMode}, promptLen=${prompts.back.fullPrompt.length}`,
      );
    }

    for (let i = 0; i < (dto.frontCount ?? 0); i++) {
      try {
        const url = await this.generateImageUrl(
          organizationId,
          {
            prompt: prompts.front?.fullPrompt || '',
            negativePrompt: prompts.front?.negativePrompt,
            aspectRatio,
            resolution,
            imageInputs,
            qualityMode,
          } as any,
          'front',
          i,
        );
        generatedUrls.push({ viewType: ViewType.FRONT, indexNumber: i, url });
      } catch (err) {
        const msg = `Front generation failed at index ${i}: ${String(err)}`;
        this.logger.error(msg);
        errors.front = msg;
        break;
      }
    }

    for (let i = 0; i < (dto.backCount ?? 0); i++) {
      try {
        const url = await this.generateImageUrl(
          organizationId,
          {
            prompt: prompts.back?.fullPrompt || '',
            negativePrompt: prompts.back?.negativePrompt,
            aspectRatio,
            resolution,
            imageInputs,
            qualityMode,
          } as any,
          'back',
          i,
        );
        generatedUrls.push({ viewType: ViewType.BACK, indexNumber: i, url });
      } catch (err) {
        const msg = `Back generation failed at index ${i}: ${String(err)}`;
        this.logger.error(msg);
        errors.back = msg;
        break;
      }
    }

    // CRITICAL: Only deduct credits if at least one image was successfully generated
    if (generatedUrls.length === 0) {
      const errorMessage =
        errors.front ||
        errors.back ||
        'Generation failed for all requested views';
      this.logger.error(
        `Generation completely failed, no credits deducted: ${errorMessage}`,
      );
      throw new BadRequestException(errorMessage);
    }

    // Calculate credits based on ACTUALLY generated images, not requested count
    const actuallyGeneratedCount = generatedUrls.length;
    const actualCreditsToDeduct = actuallyGeneratedCount * tokensPerImage;

    this.logger.log(
      `Generation partial success: ${actuallyGeneratedCount}/${totalCount} images generated, deducting ${actualCreditsToDeduct} credits (originally requested ${totalCreditsNeeded})`,
    );

    return this.prisma.$transaction(async (tx) => {
      // Deduct credits only for successfully generated images
      await this.creditsService.deductCredits({
        organizationId,
        amount: actualCreditsToDeduct,
        type: CreditType.FINAL_GENERATION,
        note: `Final generation: ${actuallyGeneratedCount}/${totalCount} images (${qualityMode}) for product "${product.name}"`,
        productId,
      });

      const request = await tx.generationRequest.create({
        data: {
          organizationId,
          productId,
          modelProfileId: dto.modelProfileId,
          scenePresetId: dto.scenePresetId,
          aspectRatio,
          resolution,
          qualityMode,
          frontCount: dto.frontCount,
          backCount: dto.backCount,
          status: GenerationStatus.DONE,
          creditsConsumed: actualCreditsToDeduct,
          frontError: errors.front,
          backError: errors.back,
        },
      });

      const images = generatedUrls.map((img) => ({
        generationRequestId: request.id,
        productId,
        viewType: img.viewType,
        indexNumber: img.indexNumber,
        imageUrl: img.url,
      }));

      await tx.generatedImage.createMany({ data: images });

      const generatedImages = await tx.generatedImage.findMany({
        where: { generationRequestId: request.id },
        orderBy: [{ viewType: 'asc' }, { indexNumber: 'asc' }],
      });

      if (errors.front || errors.back) {
        this.logger.warn(
          `Generation completed with side errors: front=${errors.front ? 'failed' : 'ok'} back=${errors.back ? 'failed' : 'ok'
          }`,
        );
      }

      return { ...request, generatedImages, errors };
    });
  }

  async getRequest(organizationId: number, requestId: number) {
    const request = await this.prisma.generationRequest.findFirst({
      where: { id: requestId, organizationId },
      include: {
        generatedImages: {
          orderBy: [{ viewType: 'asc' }, { indexNumber: 'asc' }],
        },
      },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.organizationId !== organizationId) {
      throw new NotFoundException('Resource not found or not accessible');
    }
    return request;
  }

  listRecent(organizationId: number, take = 5) {
    return this.prisma.generationRequest.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        generatedImages: {
          orderBy: [{ viewType: 'asc' }, { indexNumber: 'asc' }],
        },
        product: {
          select: { name: true, id: true },
        },
      },
    });
  }

  async runBatch(
    organizationId: number,
    dto: BatchGenerateDto,
  ): Promise<BatchGenerateResponse> {
    const productIdNum = Number(dto.productId);
    const product = await this.prisma.product.findFirst({
      where: { id: productIdNum, organizationId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const results: BatchGenerationJobResult[] = [];

    for (let i = 0; i < dto.jobs.length; i++) {
      const job = dto.jobs[i];

      if ((job.frontCount ?? 0) <= 0 && (job.backCount ?? 0) <= 0) {
        results.push({
          jobIndex: i,
          errors: {
            front: 'Invalid job: both frontCount and backCount are zero',
            back: 'Invalid job: both frontCount and backCount are zero',
          },
        });
        continue;
      }

      try {
        const generation = await this.generate(organizationId, productIdNum, {
          modelProfileId: Number(job.modelProfileId),
          scenePresetId: Number(job.sceneId),
          frontCount: job.frontCount,
          backCount: job.backCount,
          aspectRatio: job.aspectRatio as any,
          resolution: job.resolution as any,
          qualityMode: job.quality as any,
        });

        results.push({
          jobIndex: i,
          generationId: generation.id,
          errors: generation.errors,
        });
      } catch (err: any) {
        this.logger.error(
          `Batch generation job failed (product=${productIdNum}, jobIndex=${i}): ${err?.message || err}`,
        );
        results.push({
          jobIndex: i,
          errors: {
            front: `Batch job failed: ${err?.message || 'unknown error'}`,
          },
        });
      }
    }

    return { productId: String(dto.productId), results };
  }

  async listGenerations(
    organizationId: number,
    filters: {
      productId?: number;
      modelProfileId?: number;
      scenePresetId?: number;
      hasError?: boolean;
      side?: 'FRONT' | 'BACK';
      page?: number;
      pageSize?: number;
    },
  ) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize =
      filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
    const where: Prisma.GenerationRequestWhereInput = {
      organizationId,
    };
    if (filters.productId) where.productId = filters.productId;
    if (filters.modelProfileId) where.modelProfileId = filters.modelProfileId;
    if (filters.scenePresetId) where.scenePresetId = filters.scenePresetId;
    if (filters.hasError) {
      where.OR = [{ frontError: { not: null } }, { backError: { not: null } }];
    }
    if (filters.side === 'FRONT') {
      where.frontCount = { gt: 0 };
    } else if (filters.side === 'BACK') {
      where.backCount = { gt: 0 };
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.generationRequest.count({ where }),
      this.prisma.generationRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          product: { select: { id: true, name: true, productImageUrl: true } },
          modelProfile: { select: { id: true, name: true } },
          scenePreset: { select: { id: true, name: true } },
          generatedImages: { select: { id: true, viewType: true } },
        },
      }),
    ]);

    const mapped = items.map((item) => {
      const frontImagesCount = item.generatedImages.filter(
        (g) => g.viewType === ViewType.FRONT,
      ).length;
      const backImagesCount = item.generatedImages.filter(
        (g) => g.viewType === ViewType.BACK,
      ).length;
      return {
        id: item.id,
        createdAt: item.createdAt,
        productId: item.productId,
        productName: item.product?.name,
        productImageUrl: item.product?.productImageUrl,
        modelProfileId: item.modelProfileId,
        modelName: item.modelProfile?.name,
        scenePresetId: item.scenePresetId,
        sceneName: item.scenePreset?.name,
        frontCount: item.frontCount,
        backCount: item.backCount,
        frontImagesCount,
        backImagesCount,
        hasFrontError: !!item.frontError,
        hasBackError: !!item.backError,
      };
    });

    return { items: mapped, page, pageSize, total };
  }

  async getGenerationDetail(organizationId: number, id: number) {
    const request = await this.prisma.generationRequest.findFirst({
      where: { id, organizationId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            productImageUrl: true,
            productBackImageUrl: true,
          },
        },
        modelProfile: { select: { id: true, name: true } },
        scenePreset: {
          select: { id: true, name: true, backgroundReferenceUrl: true },
        },
        generatedImages: {
          orderBy: [{ viewType: 'asc' }, { indexNumber: 'asc' }],
        },
      },
    });
    if (!request) throw new NotFoundException('Generation not found');
    if (request.organizationId !== organizationId) {
      throw new NotFoundException('Resource not found or not accessible');
    }

    const frontImages = request.generatedImages.filter(
      (g) => g.viewType === ViewType.FRONT,
    );
    const backImages = request.generatedImages.filter(
      (g) => g.viewType === ViewType.BACK,
    );

    return {
      id: request.id,
      createdAt: request.createdAt,
      product: request.product,
      modelProfile: request.modelProfile,
      scene: request.scenePreset,
      frontCount: request.frontCount,
      backCount: request.backCount,
      frontImages,
      backImages,
      errors: {
        front: request.frontError || undefined,
        back: request.backError || undefined,
      },
    };
  }

  async previewPrompt(
    organizationId: number,
    dto: GenerateRequestDto & { productId: number },
  ) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, organizationId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const profile = await this.prisma.modelProfile.findFirst({
      where: { id: dto.modelProfileId, organizationId },
    });
    if (!profile) throw new NotFoundException('Model profile not found');

    const scene = await this.prisma.scenePreset.findFirst({
      where: { id: dto.scenePresetId },
    });
    if (!scene) throw new NotFoundException('Scene not found');

    const prompts = buildPrompts(
      product,
      profile,
      scene,
      {
        front: dto.customPromptFront,
        back: dto.customPromptBack,
      },
      {
        cameraAngle: dto.cameraAngle,
        shotType: dto.shotType,
        modelPose: dto.modelPose,
      },
    );

    return {
      front: prompts.front?.fullPrompt,
      back: prompts.back?.fullPrompt,
    };
  }

  private async generateImageUrl(
    organizationId: number,
    options: {
      prompt: string;
      aspectRatio: string;
      resolution: string;
      imageInputs: string[];
    },
    view: string,
    idx: number,
  ): Promise<string> {
    this.logger.log(
      `Calling AI provider for ${view.toUpperCase()} idx=${idx} org=${organizationId} aspect=${options.aspectRatio} res=${options.resolution}`,
    );

    try {
      const url = await this.aiImageService.generateForOrganization(
        organizationId,
        options,
      );
      this.logger.log(`AI generation succeeded for ${view} idx=${idx}`);
      return url;
    } catch (error) {
      const message = `AI provider failed for ${view} idx=${idx}: ${String(error)}`;
      this.logger.error(message);
      // Re-throw the error instead of returning a placeholder URL
      // This ensures credits are NOT deducted for failed generations
      throw new Error(message);
    }
  }
}
