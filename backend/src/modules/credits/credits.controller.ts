import { Controller, Get, UseGuards } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/request-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('balance')
  async getBalance(@CurrentUser() user: RequestUser) {
    const balance = await this.creditsService.getBalance(user.organizationId);
    return { balance };
  }

  @Get('transactions')
  async getTransactions(@CurrentUser() user: RequestUser) {
    const transactions = await this.creditsService.getTransactionsWithBalance(
      user.organizationId,
    );
    return { transactions };
  }
}
