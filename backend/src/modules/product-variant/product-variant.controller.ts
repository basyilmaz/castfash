import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import {
    ProductVariantService,
    CreateProductVariantDto,
    UpdateProductVariantDto,
    CreateProductSizeDto,
    CreateProductColorDto,
} from './product-variant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('product-variants')
@UseGuards(JwtAuthGuard)
export class ProductVariantController {
    constructor(private readonly variantService: ProductVariantService) { }

    // ---------------------------------------------------------------------------
    // Sizes
    // ---------------------------------------------------------------------------

    @Post('sizes')
    async createSize(@Body() dto: CreateProductSizeDto) {
        return this.variantService.createSize(dto);
    }

    @Get('sizes')
    async listSizes() {
        return this.variantService.listSizes();
    }

    @Delete('sizes/:id')
    async deleteSize(@Param('id', ParseIntPipe) id: number) {
        return this.variantService.deleteSize(id);
    }

    // ---------------------------------------------------------------------------
    // Colors
    // ---------------------------------------------------------------------------

    @Post('colors')
    async createColor(@Body() dto: CreateProductColorDto) {
        return this.variantService.createColor(dto);
    }

    @Get('colors')
    async listColors() {
        return this.variantService.listColors();
    }

    @Delete('colors/:id')
    async deleteColor(@Param('id', ParseIntPipe) id: number) {
        return this.variantService.deleteColor(id);
    }

    // ---------------------------------------------------------------------------
    // Variants
    // ---------------------------------------------------------------------------

    @Post()
    async createVariant(@Body() dto: CreateProductVariantDto) {
        return this.variantService.createVariant(dto);
    }

    @Get(':id')
    async getVariant(@Param('id', ParseIntPipe) id: number) {
        return this.variantService.getVariant(id);
    }

    @Get('product/:productId')
    async listVariantsByProduct(@Param('productId', ParseIntPipe) productId: number) {
        return this.variantService.listVariantsByProduct(productId);
    }

    @Put(':id')
    async updateVariant(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProductVariantDto,
    ) {
        return this.variantService.updateVariant(id, dto);
    }

    @Put(':id/stock')
    async updateStock(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { quantity: number; operation: 'set' | 'add' | 'subtract' },
    ) {
        return this.variantService.updateStock(id, body.quantity, body.operation);
    }

    @Delete(':id')
    async deleteVariant(@Param('id', ParseIntPipe) id: number) {
        return this.variantService.deleteVariant(id);
    }

    // ---------------------------------------------------------------------------
    // Bulk Operations
    // ---------------------------------------------------------------------------

    @Post('matrix')
    async createVariantMatrix(
        @Body() body: { productId: number; sizeIds: number[]; colorIds: number[]; basePrice?: number },
    ) {
        return this.variantService.createVariantMatrix(
            body.productId,
            body.sizeIds,
            body.colorIds,
            body.basePrice,
        );
    }

    @Put('bulk-stock')
    async bulkUpdateStock(@Body() body: { updates: Array<{ id: number; stock: number }> }) {
        return this.variantService.bulkUpdateStock(body.updates);
    }
}
