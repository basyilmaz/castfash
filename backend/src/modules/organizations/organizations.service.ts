import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdjustCreditsDto } from './dto/adjust-credits.dto';
import { CreditType } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentOrganization(organizationId: number) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async getOrganizationWithRole(userId: number, organizationId: number) {
    const organization = await this.getCurrentOrganization(organizationId);
    const membership = await this.prisma.organizationUser.findFirst({
      where: { userId, organizationId },
    });
    return { organization, role: membership?.role ?? null };
  }

  async adjustCredits(organizationId: number, dto: AdjustCreditsDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const updated = await this.prisma.organization.update({
      where: { id: organizationId },
      data: { remainingCredits: { increment: dto.amount } },
    });

    await this.prisma.creditTransaction.create({
      data: {
        organizationId,
        type: dto.amount >= 0 ? CreditType.PURCHASE : CreditType.ADJUST,
        amount: dto.amount,
        note: dto.note,
      },
    });

    return updated;
  }
}
