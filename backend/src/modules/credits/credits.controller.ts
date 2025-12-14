import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreditsService } from './credits.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/request-user.interface';

@ApiTags('Credits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get current credit balance' })
  @ApiResponse({ status: 200, description: 'Returns current credit balance' })
  async getBalance(@CurrentUser() user: RequestUser) {
    const balance = await this.creditsService.getBalance(user.organizationId);
    return { balance };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get credit transaction history' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of credit transactions',
  })
  async getTransactions(@CurrentUser() user: RequestUser) {
    const transactions = await this.creditsService.getTransactionsWithBalance(
      user.organizationId,
    );
    return { transactions };
  }
}
