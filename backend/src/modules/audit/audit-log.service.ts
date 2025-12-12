import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

export interface AuditLogData {
  action: AuditAction;
  userId?: number;
  targetType?: string;
  targetId?: number;
  changes?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData) {
    return this.prisma.auditLog.create({
      data: {
        action: data.action,
        userId: data.userId,
        targetType: data.targetType,
        targetId: data.targetId,
        changes: data.changes,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async getLogs(params?: {
    skip?: number;
    take?: number;
    action?: AuditAction;
    userId?: number;
    targetType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (params?.action) {
      where.action = params.action;
    }

    if (params?.userId) {
      where.userId = params.userId;
    }

    if (params?.targetType) {
      where.targetType = params.targetType;
    }

    if (params?.startDate || params?.endDate) {
      where.createdAt = {};
      if (params.startDate) {
        where.createdAt.gte = params.startDate;
      }
      if (params.endDate) {
        where.createdAt.lte = params.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: params?.skip || 0,
        take: params?.take || 50,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }

  async getLogsByTarget(targetType: string, targetId: number) {
    return this.prisma.auditLog.findMany({
      where: {
        targetType,
        targetId,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getRecentActivity(limit = 20) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getStats() {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const [total, last24h, last7d, byAction] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.count({
        where: { createdAt: { gte: last24Hours } },
      }),
      this.prisma.auditLog.count({
        where: { createdAt: { gte: last7Days } },
      }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        _count: true,
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      total,
      last24Hours: last24h,
      last7Days: last7d,
      topActions: byAction.map((item) => ({
        action: item.action,
        count: item._count,
      })),
    };
  }
}
