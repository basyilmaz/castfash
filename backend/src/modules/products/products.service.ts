import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AiImageService } from '../../ai-image/ai-image.service';
import { CreditsService } from '../credits/credits.service';
import { AssetType, ViewType, CreditType } from '@prisma/client';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiImageService: AiImageService,
    private readonly creditsService: CreditsService,
  ) {}

  getCategories() {
    return this.prisma.productCategory.findMany({ orderBy: { name: 'asc' } });
  }

  findAllForOrganization(organizationId: number) {
    return this.prisma.product.findMany({
      where: { organizationId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(organizationId: number, dto: CreateProductDto) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.product.create({
      data: {
        organizationId,
        categoryId: dto.categoryId,
        name: dto.name,
        sku: dto.sku,
        productImageUrl: dto.productImageUrl!,
        productBackImageUrl: dto.productBackImageUrl,
      },
    });
  }

  async findOne(organizationId: number, id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, organizationId },
      include: {
        category: true,
        generatedImages: true,
        generationRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Resource not found or not accessible');
    }

    return product;
  }

  async update(organizationId: number, id: number, dto: any) {
    // Ensure product exists and belongs to organization
    await this.findOne(organizationId, id);

    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async remove(organizationId: number, id: number) {
    // Ensure product exists and belongs to organization
    await this.findOne(organizationId, id);

    return this.prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Generate product image using AI
   * Cost: 1 token per image
   */
  async generateProductImage(
    organizationId: number,
    productId: number,
    prompt: string,
    view: ViewType,
  ): Promise<{ imageUrl: string; tokensUsed: number }> {
    const COST_PER_IMAGE = 1;

    // Verify product exists and belongs to organization
    const product = await this.findOne(organizationId, productId);

    // Check and deduct credits
    await this.creditsService.deductCredits({
      organizationId,
      amount: COST_PER_IMAGE,
      type: CreditType.PRODUCT_GENERATION,
      note: `Product ${view.toLowerCase()} image generation for "${product.name}"`,
      productId,
    });

    try {
      // Generate image with AI
      const imageUrl = await this.aiImageService.generateForOrganization(
        organizationId,
        {
          prompt: `Product photography: ${prompt}. Professional product shot, white background, high quality, commercial photography style`,
          aspectRatio: '1:1',
          resolution: '1K',
          qualityMode: 'STANDARD',
        },
      );

      // Update product with generated image
      const updateData: any = {
        tokensSpentOnCreation: {
          increment: COST_PER_IMAGE,
        },
      };

      if (view === ViewType.FRONT) {
        updateData.productImageUrl = imageUrl;
        updateData.productImageType = AssetType.AI_GENERATED;
        updateData.productImagePrompt = prompt;
      } else {
        updateData.productBackImageUrl = imageUrl;
        updateData.productBackImageType = AssetType.AI_GENERATED;
        updateData.productBackImagePrompt = prompt;
      }

      await this.prisma.product.update({
        where: { id: productId },
        data: updateData,
      });

      this.logger.log(
        `Generated ${view} image for product ${productId} (org: ${organizationId})`,
      );

      return {
        imageUrl,
        tokensUsed: COST_PER_IMAGE,
      };
    } catch (error) {
      // If AI generation fails, refund the credits
      await this.creditsService.addCredits(
        organizationId,
        COST_PER_IMAGE,
        CreditType.ADJUST,
        `Refund: Failed product image generation`,
      );

      this.logger.error(
        `Failed to generate product image: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
