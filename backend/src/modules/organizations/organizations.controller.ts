import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/request-user.interface';
import { AdjustCreditsDto } from './dto/adjust-credits.dto';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('me/organization')
  me(@CurrentUser() user: RequestUser) {
    return this.organizationsService.getOrganizationWithRole(
      user.userId,
      user.organizationId,
    );
  }

  @Post('admin/organization/:id/credits')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  adjustCredits(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdjustCreditsDto,
  ) {
    return this.organizationsService.adjustCredits(id, dto);
  }
}
