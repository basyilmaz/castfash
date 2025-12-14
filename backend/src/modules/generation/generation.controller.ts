import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { GenerationService } from './generation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/request-user.interface';
import { GenerateRequestDto } from './dto/generate-request.dto';
import { BatchGenerateDto } from './dto/batch-generate.dto';

@ApiTags('Generation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post('products/:productId/generate')
  @ApiOperation({ summary: 'Generate AI images for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 201, description: 'Generation started successfully' })
  @ApiResponse({
    status: 400,
    description: 'Insufficient credits or invalid input',
  })
  @Throttle({
    short: { limit: 2, ttl: 1000 },
    medium: { limit: 10, ttl: 60000 },
  }) // 10 requests per minute
  generate(
    @CurrentUser() user: RequestUser,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: GenerateRequestDto,
  ) {
    return this.generationService.generate(user.organizationId, productId, dto);
  }

  @Get('generation-requests')
  list(@CurrentUser() user: RequestUser) {
    return this.generationService.listRecent(user.organizationId, 5);
  }

  @Get('generation-requests/:id')
  getRequest(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.generationService.getRequest(user.organizationId, id);
  }

  @Get('generations')
  listGenerations(
    @CurrentUser() user: RequestUser,
    @Query('productId') productId?: string,
    @Query('modelProfileId') modelProfileId?: string,
    @Query('scenePresetId') scenePresetId?: string,
    @Query('hasError') hasError?: string,
    @Query('side') side?: 'FRONT' | 'BACK',
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.generationService.listGenerations(user.organizationId, {
      productId: productId ? Number(productId) : undefined,
      modelProfileId: modelProfileId ? Number(modelProfileId) : undefined,
      scenePresetId: scenePresetId ? Number(scenePresetId) : undefined,
      hasError: hasError === 'true',
      side,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get('generations/:id')
  getGenerationDetail(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.generationService.getGenerationDetail(user.organizationId, id);
  }

  @Post('generations/batch')
  @Throttle({
    short: { limit: 1, ttl: 1000 },
    medium: { limit: 5, ttl: 60000 },
  }) // 5 batch requests per minute
  batchGenerate(
    @CurrentUser() user: RequestUser,
    @Body() dto: BatchGenerateDto,
  ) {
    return this.generationService.runBatch(user.organizationId, dto);
  }

  @Post('generations/preview-prompt')
  previewPrompt(
    @CurrentUser() user: RequestUser,
    @Body() dto: GenerateRequestDto & { productId: number },
  ) {
    return this.generationService.previewPrompt(user.organizationId, dto);
  }
}
