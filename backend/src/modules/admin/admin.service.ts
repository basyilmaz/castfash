import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { AiImageService } from '../../ai-image/ai-image.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private aiImageService: AiImageService,
  ) {}

  // System Config
  async getSystemConfig(key: string) {
    return this.prisma.systemConfig.findUnique({ where: { key } });
  }

  async setSystemConfig(key: string, value: any, description?: string) {
    return this.prisma.systemConfig.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
  }

  async getAllConfigs() {
    return this.prisma.systemConfig.findMany();
  }

  // System Stats
  async getSystemStats() {
    const [
      userCount,
      orgCount,
      generationCount,
      totalCredits,
      productCount,
      modelCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.organization.count(),
      this.prisma.generationRequest.count(),
      this.prisma.organization.aggregate({ _sum: { remainingCredits: true } }),
      this.prisma.product.count(),
      this.prisma.modelProfile.count(),
    ]);

    return {
      totalUsers: userCount,
      totalOrganizations: orgCount,
      totalGenerations: generationCount,
      totalCredits: totalCredits._sum.remainingCredits || 0,
      totalProducts: productCount,
      totalModels: modelCount,
    };
  }

  // User Management
  async getUsers(params?: { skip?: number; take?: number; search?: string }) {
    const where = params?.search
      ? { email: { contains: params.search, mode: 'insensitive' as const } }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: params?.skip || 0,
        take: params?.take || 50,
        include: {
          organizations: {
            include: {
              organization: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  // Organization Management
  async getOrganizations(params?: {
    skip?: number;
    take?: number;
    search?: string;
  }) {
    const where = params?.search
      ? { name: { contains: params.search, mode: 'insensitive' as const } }
      : {};

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip: params?.skip || 0,
        take: params?.take || 50,
        include: {
          owner: true,
          _count: {
            select: {
              users: true,
              products: true,
              modelProfiles: true,
              generationRequests: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return { organizations, total };
  }

  async updateOrganizationCredits(
    orgId: number,
    credits: number,
    note?: string,
    adminUserId?: number,
  ) {
    const before = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    const org = await this.prisma.organization.update({
      where: { id: orgId },
      data: { remainingCredits: credits },
    });

    // Log the transaction
    await this.prisma.creditTransaction.create({
      data: {
        organizationId: orgId,
        type: 'ADJUST',
        amount: credits - (before?.remainingCredits || 0),
        note: note || 'Manual adjustment by admin',
      },
    });

    await this.auditLog.log({
      action: 'CREDITS_ADJUSTED',
      userId: adminUserId,
      targetType: 'Organization',
      targetId: orgId,
      changes: {
        before: { credits: before?.remainingCredits },
        after: { credits: org.remainingCredits },
      },
      metadata: { note },
    });

    return org;
  }

  // Content Management
  async getAllProducts(params?: {
    skip?: number;
    take?: number;
    search?: string;
  }) {
    const where = params?.search
      ? {
          name: {
            contains: params.search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: params?.skip || 0,
        take: params?.take || 50,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              generationRequests: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async getAllModels(params?: {
    skip?: number;
    take?: number;
    search?: string;
  }) {
    const where = params?.search
      ? {
          name: {
            contains: params.search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const [models, total] = await Promise.all([
      this.prisma.modelProfile.findMany({
        where,
        skip: params?.skip || 0,
        take: params?.take || 50,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              generationRequests: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.modelProfile.count({ where }),
    ]);

    return { models, total };
  }

  async getAllGenerations(params?: {
    skip?: number;
    take?: number;
    status?: string;
    search?: string;
  }) {
    const where: any = {};

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.search) {
      where.OR = [
        {
          product: {
            name: {
              contains: params.search,
              mode: 'insensitive' as const,
            },
          },
        },
        {
          modelProfile: {
            name: {
              contains: params.search,
              mode: 'insensitive' as const,
            },
          },
        },
      ];
    }

    const [generations, total] = await Promise.all([
      this.prisma.generationRequest.findMany({
        where,
        skip: params?.skip || 0,
        take: params?.take || 50,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          modelProfile: {
            select: {
              id: true,
              name: true,
            },
          },
          scenePreset: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              generatedImages: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.generationRequest.count({ where }),
    ]);

    return { generations, total };
  }

  // Service Settings
  async getServiceSettings() {
    const providers = await this.prisma.aiProviderConfig.findMany({
      where: { organizationId: null },
    });

    const pricingConfig = await this.getSystemConfig('TOKEN_PRICING');
    const pricing = pricingConfig?.value || { fast: 3, standard: 5, high: 8 };

    return {
      providers,
      pricing,
    };
  }

  async updateServiceSettings(data: { pricing?: any; providers?: any }) {
    if (data.pricing) {
      await this.setSystemConfig(
        'TOKEN_PRICING',
        data.pricing,
        'Token fiyatlandırması',
      );
    }
    return { success: true };
  }

  // AI Providers
  async getProviders() {
    const providers = await this.prisma.aiProviderConfig.findMany({
      where: { organizationId: null },
      orderBy: { priority: 'asc' },
    });
    console.log(
      'getProviders returning:',
      providers.map((p) => ({
        id: p.id,
        provider: p.provider,
        priority: p.priority,
      })),
    );
    return providers;
  }

  async createProvider(data: any) {
    return this.prisma.aiProviderConfig.create({
      data: {
        provider: data.type, // type maps to provider field
        apiKey: data.apiKey,
        baseUrl: data.baseUrl,
        modelId: data.modelId,
        isActive: data.isActive ?? true,
        settings: data.config || {}, // config maps to settings field
        organizationId: null, // System-wide
      },
    });
  }

  async updateProvider(id: number, data: any) {
    const updateData: any = {};

    if (data.apiKey !== undefined) updateData.apiKey = data.apiKey;
    if (data.baseUrl !== undefined) updateData.baseUrl = data.baseUrl;
    if (data.modelId !== undefined) updateData.modelId = data.modelId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.config !== undefined) updateData.settings = data.config;

    return this.prisma.aiProviderConfig.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteProvider(id: number) {
    return this.prisma.aiProviderConfig.delete({
      where: { id },
    });
  }

  async testProvider(id: number) {
    const provider = await this.prisma.aiProviderConfig.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new Error('Provider not found');
    }

    // Pre-validation: Check required fields
    const validationErrors: string[] = [];
    if (!provider.apiKey) validationErrors.push('API Key eksik');
    if (!provider.baseUrl) validationErrors.push('Base URL eksik');

    if (validationErrors.length > 0) {
      return {
        success: false,
        responseTime: 0,
        provider: provider.provider,
        error: `Yapılandırma hatası: ${validationErrors.join(', ')}`,
        configValid: false,
      };
    }

    const startTime = Date.now();

    try {
      // Real API test with minimal cost
      const testPrompt =
        'simple test image, solid blue background, minimal, 1 credit test';

      const testOptions = {
        prompt: testPrompt,
        aspectRatio: '1:1' as const,
        resolution: '1K' as const,
        qualityMode: 'FAST' as const,
        imageInputs: [],
      };

      // Use a fake org ID (0) to trigger global config fallback
      // This won't actually generate but will validate the API connection
      const result = await this.aiImageService.generateWithFallback(
        0,
        testOptions,
      );

      const responseTime = Date.now() - startTime;

      // Clear error on success (successCount is handled by AiImageService)
      await this.prisma.aiProviderConfig.update({
        where: { id },
        data: {
          lastError: null,
          lastErrorAt: null,
        },
      });

      return {
        success: true,
        responseTime,
        provider: provider.provider,
        message: `Provider başarıyla test edildi. Yanıt süresi: ${responseTime}ms`,
        imageUrl: result.imageUrl,
        providerUsed: result.providerUsed,
        configValid: true,
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      // Update provider with error
      await this.prisma.aiProviderConfig.update({
        where: { id },
        data: {
          lastError: error.message?.slice(0, 500),
          lastErrorAt: new Date(),
          errorCount: { increment: 1 },
        },
      });

      return {
        success: false,
        responseTime,
        provider: provider.provider,
        error: error.message || 'Bilinmeyen hata oluştu',
        configValid: true,
      };
    }
  }

  async getProviderStatus(id: number) {
    const provider = await this.prisma.aiProviderConfig.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new Error('Provider not found');
    }

    // Get recent generation requests using this provider
    // Note: This requires tracking which provider was used for each generation
    // For now, we'll return basic status

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Count total generations in last 24h (as proxy for provider usage)
    const recentGenerations = await this.prisma.generationRequest.count({
      where: {
        createdAt: {
          gte: last24h,
        },
      },
    });

    return {
      isActive: provider.isActive,
      provider: provider.provider,
      lastUpdated: provider.updatedAt,
      recentActivity: recentGenerations,
      hasApiKey: !!provider.apiKey,
      hasBaseUrl: !!provider.baseUrl,
      hasModelId: !!provider.modelId,
    };
  }

  async getProvidersHealth() {
    const providers = await this.prisma.aiProviderConfig.findMany({
      where: { organizationId: null },
      orderBy: { priority: 'asc' },
      select: {
        id: true,
        provider: true,
        priority: true,
        isActive: true,
        successCount: true,
        errorCount: true,
        avgResponseMs: true,
        lastError: true,
        lastErrorAt: true,
        maxRetries: true,
        timeoutMs: true,
      },
    });

    return providers.map((p) => {
      const totalCalls = p.successCount + p.errorCount;
      const successRate =
        totalCalls > 0 ? (p.successCount / totalCalls) * 100 : 0;
      const isHealthy = p.errorCount < 5 || successRate >= 50;

      return {
        ...p,
        totalCalls,
        successRate: Math.round(successRate * 100) / 100,
        isHealthy,
        status: !p.isActive ? 'disabled' : isHealthy ? 'healthy' : 'degraded',
      };
    });
  }

  async resetProviderStats(providerId: number) {
    await this.prisma.aiProviderConfig.update({
      where: { id: providerId },
      data: {
        successCount: 0,
        errorCount: 0,
        avgResponseMs: null,
        lastError: null,
        lastErrorAt: null,
      },
    });

    return { success: true, message: 'İstatistikler sıfırlandı' };
  }

  // Reports
  async getReports() {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const [recentGenerations, creditTransactions] = await Promise.all([
      this.prisma.generationRequest.findMany({
        where: {
          createdAt: { gte: last30Days },
        },
        select: {
          createdAt: true,
          status: true,
        },
      }),
      this.prisma.creditTransaction.findMany({
        where: {
          createdAt: { gte: last30Days },
        },
        select: {
          createdAt: true,
          amount: true,
          type: true,
        },
      }),
    ]);

    return {
      recentGenerations,
      creditTransactions,
    };
  }

  // Advanced Reports
  async getAdvancedReports(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily generation trends
    const dailyGenerations = await this.prisma.$queryRaw<
      Array<{ date: Date; total: bigint; successful: bigint; failed: bigint }>
    >`
            SELECT 
                DATE("createdAt") as date,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END) as successful,
                SUM(CASE WHEN status = 'ERROR' THEN 1 ELSE 0 END) as failed
            FROM "GenerationRequest"
            WHERE "createdAt" >= ${startDate}
            GROUP BY DATE("createdAt")
            ORDER BY date ASC
        `;

    // Daily credit usage
    const dailyCredits = await this.prisma.$queryRaw<
      Array<{ date: Date; spent: bigint; purchased: bigint }>
    >`
            SELECT 
                DATE("createdAt") as date,
                SUM(CASE WHEN type IN ('SPEND', 'FINAL_GENERATION') THEN ABS(amount) ELSE 0 END) as spent,
                SUM(CASE WHEN type = 'PURCHASE' THEN amount ELSE 0 END) as purchased
            FROM "CreditTransaction"
            WHERE "createdAt" >= ${startDate}
            GROUP BY DATE("createdAt")
            ORDER BY date ASC
        `;

    // Top organizations by generation count
    const topOrgsByGenerations = await this.prisma.organization.findMany({
      take: 10,
      where: {
        generationRequests: {
          some: {
            createdAt: { gte: startDate },
          },
        },
      },
      include: {
        _count: {
          select: {
            generationRequests: {
              where: { createdAt: { gte: startDate } },
            },
          },
        },
      },
      orderBy: {
        generationRequests: {
          _count: 'desc',
        },
      },
    });

    // Top organizations by credit spending
    const topOrgsByCredits = await this.prisma.$queryRaw<
      Array<{ organizationId: number; name: string; totalSpent: bigint }>
    >`
            SELECT 
                o.id as "organizationId",
                o.name,
                SUM(ABS(ct.amount)) as "totalSpent"
            FROM "Organization" o
            JOIN "CreditTransaction" ct ON ct."organizationId" = o.id
            WHERE ct."createdAt" >= ${startDate}
                AND ct.type IN ('SPEND', 'FINAL_GENERATION')
            GROUP BY o.id, o.name
            ORDER BY "totalSpent" DESC
            LIMIT 10
        `;

    // User growth
    const userGrowth = await this.prisma.$queryRaw<
      Array<{ date: Date; count: bigint }>
    >`
            SELECT 
                DATE("createdAt") as date,
                COUNT(*) as count
            FROM "User"
            WHERE "createdAt" >= ${startDate}
            GROUP BY DATE("createdAt")
            ORDER BY date ASC
        `;

    // Organization growth
    const orgGrowth = await this.prisma.$queryRaw<
      Array<{ date: Date; count: bigint }>
    >`
            SELECT 
                DATE("createdAt") as date,
                COUNT(*) as count
            FROM "Organization"
            WHERE "createdAt" >= ${startDate}
            GROUP BY DATE("createdAt")
            ORDER BY date ASC
        `;

    return {
      dailyGenerations: dailyGenerations.map((d) => ({
        date: d.date,
        total: Number(d.total),
        successful: Number(d.successful),
        failed: Number(d.failed),
      })),
      dailyCredits: dailyCredits.map((d) => ({
        date: d.date,
        spent: Number(d.spent),
        purchased: Number(d.purchased),
      })),
      topOrgsByGenerations: topOrgsByGenerations.map((org) => ({
        id: org.id,
        name: org.name,
        generationCount: org._count.generationRequests,
      })),
      topOrgsByCredits: topOrgsByCredits.map((org) => ({
        organizationId: Number(org.organizationId),
        name: org.name,
        totalSpent: Number(org.totalSpent),
      })),
      userGrowth: userGrowth.map((d) => ({
        date: d.date,
        count: Number(d.count),
      })),
      orgGrowth: orgGrowth.map((d) => ({
        date: d.date,
        count: Number(d.count),
      })),
    };
  }

  // User Detail and Management
  async getUserDetail(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizations: {
          include: {
            organization: {
              include: {
                _count: {
                  select: {
                    products: true,
                    modelProfiles: true,
                    generationRequests: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get user's total generations and credits spent
    const userOrgIds = user.organizations.map((o) => o.organization.id);
    const [totalGenerations, totalCreditsSpent] = await Promise.all([
      this.prisma.generationRequest.count({
        where: { organizationId: { in: userOrgIds } },
      }),
      this.prisma.creditTransaction.aggregate({
        where: {
          organizationId: { in: userOrgIds },
          type: { in: ['SPEND', 'FINAL_GENERATION'] },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      ...user,
      stats: {
        totalGenerations,
        totalCreditsSpent: Math.abs(totalCreditsSpent._sum.amount || 0),
      },
    };
  }

  async updateUser(
    userId: number,
    data: { email?: string; isSuperAdmin?: boolean },
    adminUserId?: number,
  ) {
    const before = await this.prisma.user.findUnique({ where: { id: userId } });

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    await this.auditLog.log({
      action: 'USER_UPDATED',
      userId: adminUserId,
      targetType: 'User',
      targetId: userId,
      changes: {
        before: { email: before?.email, isSuperAdmin: before?.isSuperAdmin },
        after: { email: updated.email, isSuperAdmin: updated.isSuperAdmin },
      },
    });

    return updated;
  }

  async deleteUser(userId: number, adminUserId?: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const deleted = await this.prisma.user.delete({
      where: { id: userId },
    });

    await this.auditLog.log({
      action: 'USER_DELETED',
      userId: adminUserId,
      targetType: 'User',
      targetId: userId,
      metadata: { email: user?.email },
    });

    return deleted;
  }

  async resetUserPassword(
    userId: number,
    newPassword: string,
    adminUserId?: number,
  ) {
    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    await this.auditLog.log({
      action: 'USER_PASSWORD_RESET',
      userId: adminUserId,
      targetType: 'User',
      targetId: userId,
      metadata: { resetBy: 'admin' },
    });

    return { success: true, message: 'Şifre başarıyla sıfırlandı' };
  }

  // Organization Detail and Management
  async getOrganizationDetail(orgId: number) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        owner: true,
        users: {
          include: {
            user: true,
          },
        },
        products: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        modelProfiles: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        generationRequests: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            product: true,
          },
        },
        creditTransactions: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            users: true,
            products: true,
            modelProfiles: true,
            generationRequests: true,
          },
        },
      },
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    return org;
  }

  async updateOrganization(
    orgId: number,
    data: { name?: string; ownerId?: number },
    adminUserId?: number,
  ) {
    const before = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    const updated = await this.prisma.organization.update({
      where: { id: orgId },
      data,
    });

    await this.auditLog.log({
      action: 'ORGANIZATION_UPDATED',
      userId: adminUserId,
      targetType: 'Organization',
      targetId: orgId,
      changes: {
        before: { name: before?.name, ownerId: before?.ownerId },
        after: { name: updated.name, ownerId: updated.ownerId },
      },
    });

    return updated;
  }

  async deleteOrganization(orgId: number, adminUserId?: number) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    const deleted = await this.prisma.organization.delete({
      where: { id: orgId },
    });

    await this.auditLog.log({
      action: 'ORGANIZATION_DELETED',
      userId: adminUserId,
      targetType: 'Organization',
      targetId: orgId,
      metadata: { name: org?.name },
    });

    return deleted;
  }

  // Product Detail
  async getProductDetail(productId: number) {
    return this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        organization: true,
        category: true,
        generationRequests: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            generatedImages: true,
          },
        },
        _count: {
          select: {
            generationRequests: true,
            generatedImages: true,
          },
        },
      },
    });
  }

  // Model Detail
  async getModelDetail(modelId: number) {
    return this.prisma.modelProfile.findUnique({
      where: { id: modelId },
      include: {
        organization: true,
        generationRequests: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            product: true,
            generatedImages: true,
          },
        },
        _count: {
          select: {
            generationRequests: true,
          },
        },
      },
    });
  }

  // Generation Detail
  async getGenerationDetail(genId: number) {
    return this.prisma.generationRequest.findUnique({
      where: { id: genId },
      include: {
        organization: true,
        product: true,
        modelProfile: true,
        scenePreset: true,
        generatedImages: {
          orderBy: { indexNumber: 'asc' },
        },
      },
    });
  }

  // Audit Logs
  async getAuditLogs(params?: {
    skip?: number;
    take?: number;
    action?: any;
    userId?: number;
    targetType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.auditLog.getLogs(params);
  }

  async getAuditStats() {
    return this.auditLog.getStats();
  }

  async getRecentActivity(limit?: number) {
    return this.auditLog.getRecentActivity(limit);
  }

  async getAuditLogsByTarget(targetType: string, targetId: number) {
    return this.auditLog.getLogsByTarget(targetType, targetId);
  }

  // Log Management
  async getLogFiles() {
    const fs = await import('fs');
    const path = await import('path');
    const logDir = path.join(process.cwd(), 'logs');

    if (!fs.existsSync(logDir)) {
      return { files: [], message: 'Log dizini bulunamadı' };
    }

    const files = fs
      .readdirSync(logDir)
      .filter((f) => f.endsWith('.log'))
      .map((filename) => {
        const filepath = path.join(logDir, filename);
        const stats = fs.statSync(filepath);
        return {
          filename,
          size: stats.size,
          sizeHuman: this.formatBytes(stats.size),
          modified: stats.mtime,
        };
      })
      .sort((a, b) => b.modified.getTime() - a.modified.getTime());

    return { files };
  }

  async getLogContent(filename: string, lines: number = 100) {
    const fs = await import('fs');
    const path = await import('path');
    const readline = await import('readline');
    const logDir = path.join(process.cwd(), 'logs');
    const filepath = path.join(logDir, filename);

    // Security: prevent directory traversal
    if (
      !filename.endsWith('.log') ||
      filename.includes('..') ||
      filename.includes('/')
    ) {
      throw new Error('Geçersiz dosya adı');
    }

    if (!fs.existsSync(filepath)) {
      throw new Error('Dosya bulunamadı');
    }

    // Read last N lines
    const content = fs.readFileSync(filepath, 'utf-8');
    const allLines = content.split('\n').filter((l) => l.trim());
    const lastLines = allLines.slice(-lines);

    const entries = lastLines
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return { raw: line };
        }
      })
      .reverse(); // Most recent first

    return {
      filename,
      totalLines: allLines.length,
      showing: entries.length,
      entries,
    };
  }

  async getRecentLogs(minutes: number = 5) {
    const fs = await import('fs');
    const path = await import('path');
    const logDir = path.join(process.cwd(), 'logs');

    if (!fs.existsSync(logDir)) {
      return { entries: [], message: 'Log dizini bulunamadı' };
    }

    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const today = new Date().toISOString().split('T')[0];
    const combinedFile = path.join(logDir, `combined-${today}.log`);

    if (!fs.existsSync(combinedFile)) {
      return { entries: [], message: 'Bugünkü log dosyası bulunamadı' };
    }

    const content = fs.readFileSync(combinedFile, 'utf-8');
    const entries = content
      .split('\n')
      .filter((l) => l.trim())
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((entry) => entry && new Date(entry.timestamp) >= cutoff)
      .reverse()
      .slice(0, 100); // Max 100 entries

    return { entries, minutes, cutoff: cutoff.toISOString() };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
