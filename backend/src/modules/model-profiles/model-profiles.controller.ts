import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
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
import { ModelProfilesService } from './model-profiles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/request-user.interface';
import { CreateModelProfileDto } from './dto/create-model-profile.dto';

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

@UseGuards(JwtAuthGuard)
@Controller('model-profiles')
export class ModelProfilesController {
  constructor(private readonly modelProfilesService: ModelProfilesService) {}

  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    return this.modelProfilesService.findAll(user.organizationId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.modelProfilesService.findOne(user.organizationId, id);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'faceFile', maxCount: 1 },
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
    @Body() dto: CreateModelProfileDto,
    @UploadedFiles()
    files: {
      faceFile?: Express.Multer.File[];
      backFile?: Express.Multer.File[];
    },
    @Req() req: Request,
  ) {
    const host =
      process.env.APP_PUBLIC_URL ||
      process.env.BASE_URL ||
      `${req.protocol}://${req.get('host')}`;

    if (files?.faceFile?.[0]) {
      dto.faceReferenceUrl = `${host}/uploads/${files.faceFile[0].filename}`;
    }

    if (files?.backFile?.[0]) {
      dto.backReferenceUrl = `${host}/uploads/${files.backFile[0].filename}`;
    }

    return this.modelProfilesService.create(user.organizationId, dto);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'faceFile', maxCount: 1 },
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
  update(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateModelProfileDto,
    @UploadedFiles()
    files: {
      faceFile?: Express.Multer.File[];
      backFile?: Express.Multer.File[];
    },
    @Req() req: Request,
  ) {
    const host =
      process.env.APP_PUBLIC_URL ||
      process.env.BASE_URL ||
      `${req.protocol}://${req.get('host')}`;

    if (files?.faceFile?.[0]) {
      dto.faceReferenceUrl = `${host}/uploads/${files.faceFile[0].filename}`;
    }

    if (files?.backFile?.[0]) {
      dto.backReferenceUrl = `${host}/uploads/${files.backFile[0].filename}`;
    }

    return this.modelProfilesService.update(user.organizationId, id, dto);
  }

  @Post(':id/generate-reference')
  generateReference(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { prompt: string; view: 'FACE' | 'BACK' },
  ) {
    if (!body.prompt) {
      throw new BadRequestException('Prompt is required');
    }
    if (!['FACE', 'BACK'].includes(body.view)) {
      throw new BadRequestException('View must be FACE or BACK');
    }

    return this.modelProfilesService.generateReferenceImage(
      user.organizationId,
      id,
      body.prompt,
      body.view,
    );
  }
}
