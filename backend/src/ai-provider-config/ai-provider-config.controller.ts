import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AiProviderConfigService } from './ai-provider-config.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.interface';
import { UpdateAiProviderConfigDto } from './dto/update-ai-provider-config.dto';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('ai-providers/config')
export class AiProviderConfigController {
  constructor(
    private readonly aiProviderConfigService: AiProviderConfigService,
  ) {}

  @Get()
  getConfig(@CurrentUser() user: RequestUser) {
    return this.aiProviderConfigService.getActiveConfig(user.organizationId);
  }

  @Put()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  updateConfig(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateAiProviderConfigDto,
  ) {
    return this.aiProviderConfigService.upsertOrgConfig(
      user.organizationId,
      dto,
    );
  }
}
