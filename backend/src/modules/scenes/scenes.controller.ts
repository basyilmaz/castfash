import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Request } from 'express';
import { ScenesService } from './scenes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/request-user.interface';
import { CreateSceneDto } from './dto/create-scene.dto';
import { UpdateSceneDto } from './dto/update-scene.dto';
import { ImportScenesDto } from './dto/import-scenes.dto';

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

@ApiTags('Scenes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scenes')
export class ScenesController {
  constructor(private readonly scenesService: ScenesService) { }

  @Get()
  findAll(
    @CurrentUser() user: RequestUser,
    @Query('category') category?: string,
    @Query('q') q?: string,
  ) {
    return this.scenesService.findAll(user.organizationId, { category, q });
  }

  @Get('export')
  async export(@CurrentUser() user: RequestUser) {
    const scenes = await this.scenesService.exportScenes(user.organizationId);
    return { scenes };
  }

  @Post('import')
  async importScenes(
    @CurrentUser() user: RequestUser,
    @Body() dto: ImportScenesDto,
  ) {
    const result = await this.scenesService.importScenes(
      dto.scenes,
      user.organizationId,
    );
    return result;
  }

  @Post('seed-presets')
  seedPresets(@CurrentUser() user: RequestUser) {
    return this.scenesService
      .seedPresetsForOrg(user.organizationId)
      .then((scenes) => ({ created: scenes.length }));
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.scenesService.findOne(user.organizationId, id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          try {
            const dir = ensureUploadsDir();
            cb(null, dir);
          } catch (error) {
            cb(error as Error, '');
          }
        },
        filename: (_req, file, cb) => {
          cb(null, generateFilename(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
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
    }),
  )
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateSceneDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    try {
      if (file) {
        const host =
          process.env.APP_PUBLIC_URL ||
          process.env.BASE_URL ||
          `${req.protocol}://${req.get('host')}`;
        dto.backgroundReferenceUrl = `${host}/uploads/${file.filename}`;
      }

      return await this.scenesService.create(user.organizationId, dto);
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Controller Error: ${error.message}`,
      );
    }
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          try {
            const dir = ensureUploadsDir();
            cb(null, dir);
          } catch (error) {
            cb(error as Error, '');
          }
        },
        filename: (_req, file, cb) => {
          cb(null, generateFilename(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
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
    }),
  )
  update(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSceneDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    if (file) {
      const host =
        process.env.APP_PUBLIC_URL ||
        process.env.BASE_URL ||
        `${req.protocol}://${req.get('host')}`;
      dto.backgroundReferenceUrl = `${host}/uploads/${file.filename}`;
    }

    return this.scenesService.update(user.organizationId, id, dto);
  }

  @Post(':id/generate-background')
  generateBackground(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { prompt: string },
  ) {
    if (!body.prompt) {
      throw new BadRequestException('Prompt is required');
    }

    return this.scenesService.generateBackground(
      user.organizationId,
      id,
      body.prompt,
    );
  }
}
