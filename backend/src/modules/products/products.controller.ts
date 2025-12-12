import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Request } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/request-user.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

function ensureUploadsDir() {
  const dir = join(process.cwd(), 'uploads');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function generateFilename(originalName: string) {
  const ext = extname(originalName) || '.jpg';
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${unique}${ext}`;
}

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categories')
  @ApiOperation({
    summary: 'Kategori listesi',
    description: 'Tüm ürün kategorilerini listeler.',
  })
  @ApiResponse({
    status: 200,
    description: 'Kategori listesi başarıyla döndürüldü.',
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim.' })
  categories() {
    return this.productsService.getCategories();
  }

  @Get('products')
  @ApiOperation({
    summary: 'Ürün listesi',
    description: 'Organizasyona ait tüm ürünleri listeler.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ürün listesi başarıyla döndürüldü.',
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim.' })
  findAll(@CurrentUser() user: RequestUser) {
    return this.productsService.findAllForOrganization(user.organizationId);
  }

  @Post('products')
  @ApiOperation({
    summary: 'Yeni ürün oluştur',
    description: 'Yeni bir ürün ekler. Görsel yüklemesi desteklenir.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Ürün adı' },
        description: { type: 'string', description: 'Ürün açıklaması' },
        categoryId: { type: 'number', description: 'Kategori ID' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Ön görsel (JPEG, PNG, WEBP)',
        },
        backFile: {
          type: 'string',
          format: 'binary',
          description: 'Arka görsel (opsiyonel)',
        },
      },
      required: ['name', 'categoryId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Ürün başarıyla oluşturuldu.' })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz giriş verileri veya dosya formatı.',
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim.' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'backFile', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (_req, _file, cb) => {
            const dir = ensureUploadsDir();
            cb(null, dir);
          },
          filename: (_req, file, cb) => {
            cb(null, generateFilename(file.originalname));
          },
        }),
        fileFilter: (_req, file, cb) => {
          const allowed = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/jpg',
          ];
          if (!allowed.includes(file.mimetype)) {
            return cb(
              new BadRequestException(
                'Only JPEG, PNG or WEBP image files are allowed',
              ),
              false,
            );
          }
          cb(null, true);
        },
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
      },
    ),
  )
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateProductDto,
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; backFile?: Express.Multer.File[] },
    @Req() req: Request,
  ) {
    const host =
      process.env.APP_PUBLIC_URL ||
      process.env.BASE_URL ||
      `${req.protocol}://${req.get('host')}`;

    if (files?.file?.[0]) {
      dto.productImageUrl = `${host}/uploads/${files.file[0].filename}`;
    }

    if (files?.backFile?.[0]) {
      dto.productBackImageUrl = `${host}/uploads/${files.backFile[0].filename}`;
    }

    if (!dto.productImageUrl) {
      throw new BadRequestException(
        'Product image is required (either file upload or URL)',
      );
    }

    // Handle multipart/form-data number conversion
    if (typeof dto.categoryId === 'string') {
      dto.categoryId = parseInt(dto.categoryId, 10);
    }

    return this.productsService.create(user.organizationId, dto);
  }

  @Get('products/:id')
  @ApiOperation({
    summary: 'Ürün detayı',
    description: "Belirtilen ID'ye sahip ürünün detaylarını getirir.",
  })
  @ApiResponse({
    status: 200,
    description: 'Ürün detayları başarıyla döndürüldü.',
  })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı.' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim.' })
  findOne(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.findOne(user.organizationId, id);
  }

  @Patch('products/:id')
  @ApiOperation({
    summary: 'Ürün güncelle',
    description: 'Belirtilen ürünü günceller.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Ürün başarıyla güncellendi.' })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı.' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim.' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'backFile', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (_req, _file, cb) => {
            const dir = ensureUploadsDir();
            cb(null, dir);
          },
          filename: (_req, file, cb) => {
            cb(null, generateFilename(file.originalname));
          },
        }),
        fileFilter: (_req, file, cb) => {
          const allowed = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/jpg',
          ];
          if (!allowed.includes(file.mimetype)) {
            return cb(
              new BadRequestException(
                'Only JPEG, PNG or WEBP image files are allowed',
              ),
              false,
            );
          }
          cb(null, true);
        },
        limits: {
          fileSize: 10 * 1024 * 1024,
        },
      },
    ),
  )
  update(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; backFile?: Express.Multer.File[] },
    @Req() req: Request,
  ) {
    const host =
      process.env.APP_PUBLIC_URL ||
      process.env.BASE_URL ||
      `${req.protocol}://${req.get('host')}`;

    if (files?.file?.[0]) {
      dto.productImageUrl = `${host}/uploads/${files.file[0].filename}`;
    }

    if (files?.backFile?.[0]) {
      dto.productBackImageUrl = `${host}/uploads/${files.backFile[0].filename}`;
    }

    return this.productsService.update(user.organizationId, id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Ürün sil', description: 'Belirtilen ürünü siler.' })
  @ApiResponse({ status: 200, description: 'Ürün başarıyla silindi.' })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı.' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim.' })
  remove(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.remove(user.organizationId, id);
  }

  @Post('products/:id/generate-image')
  @ApiOperation({
    summary: 'Ürün görseli üret',
    description: 'AI kullanarak ürün için görsel üretir.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: "Görsel üretim prompt'u" },
        view: {
          type: 'string',
          enum: ['FRONT', 'BACK'],
          description: 'Görsel açısı',
        },
      },
      required: ['prompt', 'view'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Görsel üretimi başarıyla başlatıldı.',
  })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı.' })
  @ApiResponse({ status: 402, description: 'Yetersiz kredi.' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim.' })
  async generateImage(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { prompt: string; view: 'FRONT' | 'BACK' },
  ) {
    return this.productsService.generateProductImage(
      user.organizationId,
      id,
      dto.prompt,
      dto.view as any,
    );
  }
}
