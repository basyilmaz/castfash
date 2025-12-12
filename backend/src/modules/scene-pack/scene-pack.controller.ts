import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ScenePackService } from './scene-pack.service';
import { CreateScenePackDto } from './dto/create-scene-pack.dto';
import { UpdateScenePackDto } from './dto/update-scene-pack.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/request-user.interface';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('scene-packs')
export class ScenePackController {
  constructor(private readonly scenePackService: ScenePackService) {}

  @Get()
  findAll() {
    return this.scenePackService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  create(@Body() dto: CreateScenePackDto) {
    return this.scenePackService.create(dto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  update(@Param('id') id: string, @Body() dto: UpdateScenePackDto) {
    return this.scenePackService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  remove(@Param('id') id: string) {
    return this.scenePackService.remove(id);
  }

  @Post('seed')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  seed() {
    return this.scenePackService.seedScenePacks().then(() => ({
      status: 'ok',
    }));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scenePackService.findOne(id);
  }

  @Post(':id/install')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  install(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.scenePackService.installPackToOrg(id, user.organizationId);
  }
}
