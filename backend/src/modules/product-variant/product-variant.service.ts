import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// =============================================================================
// DTOs
// =============================================================================

export interface CreateProductVariantDto {
  productId: number;
  sku?: string;
  sizeId?: number;
  colorId?: number;
  stock?: number;
  price?: number;
  imageUrl?: string;
}

export interface UpdateProductVariantDto {
  sku?: string;
  sizeId?: number;
  colorId?: number;
  stock?: number;
  price?: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface CreateProductSizeDto {
  name: string;
  order?: number;
}

export interface CreateProductColorDto {
  name: string;
  hexCode: string;
}

// =============================================================================
// Service
// =============================================================================

@Injectable()
export class ProductVariantService {
  private readonly logger = new Logger(ProductVariantService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Product Sizes
  // ---------------------------------------------------------------------------

  async createSize(dto: CreateProductSizeDto) {
    const size = await this.prisma.productSize.create({
      data: {
        name: dto.name,
        order: dto.order ?? 0,
      },
    });
    this.logger.log(`Created product size: ${size.name}`);
    return size;
  }

  async listSizes() {
    return this.prisma.productSize.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { variants: true } },
      },
    });
  }

  async deleteSize(id: number) {
    await this.prisma.productSize.delete({ where: { id } });
    return { success: true };
  }

  // ---------------------------------------------------------------------------
  // Product Colors
  // ---------------------------------------------------------------------------

  async createColor(dto: CreateProductColorDto) {
    const color = await this.prisma.productColor.create({
      data: {
        name: dto.name,
        hexCode: dto.hexCode,
      },
    });
    this.logger.log(`Created product color: ${color.name}`);
    return color;
  }

  async listColors() {
    return this.prisma.productColor.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { variants: true } },
      },
    });
  }

  async deleteColor(id: number) {
    await this.prisma.productColor.delete({ where: { id } });
    return { success: true };
  }

  // ---------------------------------------------------------------------------
  // Product Variants
  // ---------------------------------------------------------------------------

  async createVariant(dto: CreateProductVariantDto) {
    const variant = await this.prisma.productVariant.create({
      data: {
        productId: dto.productId,
        sku: dto.sku,
        sizeId: dto.sizeId,
        colorId: dto.colorId,
        stock: dto.stock ?? 0,
        price: dto.price,
        imageUrl: dto.imageUrl,
      },
      include: {
        size: true,
        color: true,
      },
    });
    this.logger.log(`Created product variant: ${variant.id}`);
    return variant;
  }

  async getVariant(id: number) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        size: true,
        color: true,
        product: { select: { id: true, name: true } },
      },
    });

    if (!variant) {
      throw new NotFoundException(`Variant ${id} not found`);
    }

    return variant;
  }

  async listVariantsByProduct(productId: number) {
    return this.prisma.productVariant.findMany({
      where: { productId, isActive: true },
      include: {
        size: true,
        color: true,
      },
      orderBy: [{ sizeId: 'asc' }, { colorId: 'asc' }],
    });
  }

  async updateVariant(id: number, dto: UpdateProductVariantDto) {
    const variant = await this.prisma.productVariant.update({
      where: { id },
      data: dto,
      include: {
        size: true,
        color: true,
      },
    });
    this.logger.log(`Updated product variant: ${variant.id}`);
    return variant;
  }

  async updateStock(
    id: number,
    quantity: number,
    operation: 'set' | 'add' | 'subtract',
  ) {
    const updateData: Prisma.ProductVariantUpdateInput = {};

    if (operation === 'set') {
      updateData.stock = quantity;
    } else if (operation === 'add') {
      updateData.stock = { increment: quantity };
    } else if (operation === 'subtract') {
      updateData.stock = { decrement: quantity };
    }

    const variant = await this.prisma.productVariant.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(
      `Updated stock for variant ${id}: ${operation} ${quantity}`,
    );
    return variant;
  }

  async deleteVariant(id: number) {
    await this.prisma.productVariant.delete({ where: { id } });
    this.logger.log(`Deleted product variant: ${id}`);
    return { success: true };
  }

  // ---------------------------------------------------------------------------
  // Bulk Operations
  // ---------------------------------------------------------------------------

  async createVariantMatrix(
    productId: number,
    sizeIds: number[],
    colorIds: number[],
    basePrice?: number,
  ) {
    const variants: CreateProductVariantDto[] = [];

    for (const sizeId of sizeIds) {
      for (const colorId of colorIds) {
        variants.push({
          productId,
          sizeId,
          colorId,
          price: basePrice,
          stock: 0,
        });
      }
    }

    const created = await this.prisma.productVariant.createMany({
      data: variants,
      skipDuplicates: true,
    });

    this.logger.log(
      `Created ${created.count} variants for product ${productId}`,
    );
    return { count: created.count };
  }

  async bulkUpdateStock(updates: Array<{ id: number; stock: number }>) {
    const results = await Promise.all(
      updates.map((update) =>
        this.prisma.productVariant.update({
          where: { id: update.id },
          data: { stock: update.stock },
        }),
      ),
    );

    this.logger.log(`Bulk updated stock for ${results.length} variants`);
    return { count: results.length };
  }
}
