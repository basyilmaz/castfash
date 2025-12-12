import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditType } from '@prisma/client';

export interface DeductCreditsParams {
  organizationId: number;
  amount: number;
  type: CreditType;
  note?: string;
  productId?: number;
  modelProfileId?: number;
  scenePresetId?: number;
  generationRequestId?: number;
}

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get current credit balance for an organization
   */
  async getBalance(organizationId: number): Promise<number> {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { remainingCredits: true },
    });

    if (!org) {
      throw new BadRequestException('Organization not found');
    }

    return org.remainingCredits;
  }

  /**
   * Check if organization has enough credits
   */
  async hasEnoughCredits(
    organizationId: number,
    amount: number,
  ): Promise<boolean> {
    const balance = await this.getBalance(organizationId);
    return balance >= amount;
  }

  /**
   * Deduct credits from organization and create transaction record
   */
  async deductCredits(params: DeductCreditsParams): Promise<void> {
    const {
      organizationId,
      amount,
      type,
      note,
      productId,
      modelProfileId,
      scenePresetId,
      generationRequestId,
    } = params;

    // Check balance
    const hasEnough = await this.hasEnoughCredits(organizationId, amount);
    if (!hasEnough) {
      const balance = await this.getBalance(organizationId);
      throw new BadRequestException(
        `Insufficient credits. Required: ${amount}, Available: ${balance}`,
      );
    }

    // Deduct credits and create transaction in a single transaction
    await this.prisma.$transaction(async (tx) => {
      // Update organization balance
      await tx.organization.update({
        where: { id: organizationId },
        data: {
          remainingCredits: {
            decrement: amount,
          },
        },
      });

      // Create transaction record
      await tx.creditTransaction.create({
        data: {
          organizationId,
          type,
          amount: -amount, // Negative for deduction
          note: note || `${type} - ${amount} credits`,
          productId,
          modelProfileId,
          scenePresetId,
          generationRequestId,
        },
      });
    });

    this.logger.log(
      `Deducted ${amount} credits from org ${organizationId} for ${type}`,
    );
  }

  /**
   * Add credits to organization (for purchases or adjustments)
   */
  async addCredits(
    organizationId: number,
    amount: number,
    type: CreditType = CreditType.PURCHASE,
    note?: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.organization.update({
        where: { id: organizationId },
        data: {
          remainingCredits: {
            increment: amount,
          },
        },
      });

      await tx.creditTransaction.create({
        data: {
          organizationId,
          type,
          amount, // Positive for addition
          note: note || `${type} - ${amount} credits added`,
        },
      });
    });

    this.logger.log(
      `Added ${amount} credits to org ${organizationId} for ${type}`,
    );
  }

  /**
   * Get credit transaction history
   */
  async getTransactions(
    organizationId: number,
    limit: number = 50,
  ): Promise<any[]> {
    return this.prisma.creditTransaction.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        amount: true,
        note: true,
        createdAt: true,
        productId: true,
        modelProfileId: true,
        scenePresetId: true,
        generationRequestId: true,
      },
    });
  }

  /**
   * Calculate running balance for transaction history
   */
  async getTransactionsWithBalance(
    organizationId: number,
    limit: number = 50,
  ): Promise<any[]> {
    const transactions = await this.getTransactions(organizationId, limit);
    const currentBalance = await this.getBalance(organizationId);

    let runningBalance = currentBalance;
    const result: any[] = [];

    for (const tx of transactions) {
      result.push({
        ...tx,
        balanceAfter: runningBalance,
      });
      runningBalance -= tx.amount;
    }

    return result;
  }
}
