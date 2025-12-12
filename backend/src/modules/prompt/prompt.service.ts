import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PromptType, PromptCategoryType } from '@prisma/client';

@Injectable()
export class PromptService {
  constructor(private prisma: PrismaService) {}

  // Template CRUD
  async getTemplates(filters?: {
    type?: PromptType;
    category?: PromptCategoryType;
    isActive?: boolean;
  }) {
    const where: any = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.category) where.category = filters.category;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    const [templates, total] = await Promise.all([
      this.prisma.promptTemplate.findMany({
        where,
        include: {
          _count: {
            select: {
              versions: true,
              analytics: true,
            },
          },
        },
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.promptTemplate.count({ where }),
    ]);

    return { templates, total };
  }

  async getTemplate(id: number) {
    return this.prisma.promptTemplate.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        analytics: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    });
  }

  async createTemplate(data: {
    name: string;
    type: PromptType;
    category?: PromptCategoryType;
    content: string;
    variables?: any;
    priority?: number;
    tags?: string[];
    createdBy?: number;
  }) {
    // Create template
    const template = await this.prisma.promptTemplate.create({
      data: {
        name: data.name,
        type: data.type,
        category: data.category,
        content: data.content,
        variables: data.variables,
        priority: data.priority || 0,
        tags: data.tags || [],
        createdBy: data.createdBy,
      },
    });

    // Create initial version
    await this.prisma.promptVersion.create({
      data: {
        templateId: template.id,
        version: 'v1.0',
        content: data.content,
        changes: 'Initial version',
        createdBy: data.createdBy,
      },
    });

    return template;
  }

  async updateTemplate(
    id: number,
    data: {
      name?: string;
      content?: string;
      variables?: any;
      isActive?: boolean;
      priority?: number;
      tags?: string[];
      createdBy?: number;
    },
  ) {
    const currentTemplate = await this.prisma.promptTemplate.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!currentTemplate) {
      throw new Error('Template not found');
    }

    // If content changed, create new version
    if (data.content && data.content !== currentTemplate.content) {
      const lastVersion = currentTemplate.versions[0];
      const versionNumber = lastVersion
        ? parseFloat(lastVersion.version.replace('v', '')) + 0.1
        : 1.0;

      await this.prisma.promptVersion.create({
        data: {
          templateId: id,
          version: `v${versionNumber.toFixed(1)}`,
          content: data.content,
          changes: 'Updated content',
          createdBy: data.createdBy,
        },
      });
    }

    return this.prisma.promptTemplate.update({
      where: { id },
      data: {
        name: data.name,
        content: data.content,
        variables: data.variables,
        isActive: data.isActive,
        priority: data.priority,
        tags: data.tags,
      },
    });
  }

  async deleteTemplate(id: number) {
    return this.prisma.promptTemplate.delete({
      where: { id },
    });
  }

  // Preset CRUD
  async getPresets(filters?: { isActive?: boolean }) {
    const where: any = {};
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    const [presets, total] = await Promise.all([
      this.prisma.promptPreset.findMany({
        where,
        orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.promptPreset.count({ where }),
    ]);

    return { presets, total };
  }

  async getPreset(id: number) {
    return this.prisma.promptPreset.findUnique({
      where: { id },
    });
  }

  async createPreset(data: {
    name: string;
    description?: string;
    scenePrompt?: string;
    posePrompt?: string;
    lightingPrompt?: string;
    stylePrompt?: string;
    negativePrompt?: string;
    tags?: string[];
    createdBy?: number;
  }) {
    return this.prisma.promptPreset.create({
      data: {
        name: data.name,
        description: data.description,
        scenePrompt: data.scenePrompt,
        posePrompt: data.posePrompt,
        lightingPrompt: data.lightingPrompt,
        stylePrompt: data.stylePrompt,
        negativePrompt: data.negativePrompt,
        tags: data.tags || [],
        createdBy: data.createdBy,
      },
    });
  }

  async updatePreset(id: number, data: any) {
    return this.prisma.promptPreset.update({
      where: { id },
      data,
    });
  }

  async deletePreset(id: number) {
    return this.prisma.promptPreset.delete({
      where: { id },
    });
  }

  async incrementPresetUsage(id: number) {
    return this.prisma.promptPreset.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }

  // Analytics
  async getTemplateAnalytics(templateId: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await this.prisma.promptAnalytics.findMany({
      where: {
        templateId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalUsage = analytics.length;
    const successCount = analytics.filter((a) => a.success).length;
    const successRate = totalUsage > 0 ? (successCount / totalUsage) * 100 : 0;
    const avgQuality =
      analytics.reduce((sum, a) => sum + (a.qualityScore || 0), 0) /
      (totalUsage || 1);
    const avgExecutionTime =
      analytics.reduce((sum, a) => sum + (a.executionTime || 0), 0) /
      (totalUsage || 1);

    // Top combinations
    const combinationMap = new Map<string, number>();
    analytics.forEach((a) => {
      if (a.combination) {
        const key = JSON.stringify(a.combination);
        combinationMap.set(key, (combinationMap.get(key) || 0) + 1);
      }
    });

    const topCombinations = Array.from(combinationMap.entries())
      .map(([combination, count]) => ({
        combination: JSON.parse(combination),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalUsage,
      successRate: parseFloat(successRate.toFixed(2)),
      avgQuality: parseFloat(avgQuality.toFixed(2)),
      avgExecutionTime: Math.round(avgExecutionTime),
      topCombinations,
      recentAnalytics: analytics.slice(0, 20),
    };
  }

  // Prompt Combination
  async combinePrompts(input: {
    masterTemplateIds?: number[];
    sceneSelection?: string;
    poseSelection?: string;
    lightingSelection?: string;
    styleSelection?: string;
    customPrompt?: string;
    negativePrompt?: string;
    variables?: Record<string, string>;
  }): Promise<{ positive: string; negative: string }> {
    const parts: string[] = [];
    const negativeParts: string[] = [];

    // Get master templates
    if (input.masterTemplateIds && input.masterTemplateIds.length > 0) {
      const templates = await this.prisma.promptTemplate.findMany({
        where: {
          id: { in: input.masterTemplateIds },
          isActive: true,
        },
        orderBy: { priority: 'asc' },
      });

      templates.forEach((t) => {
        if (t.type === 'NEGATIVE') {
          negativeParts.push(t.content);
        } else {
          parts.push(t.content);
        }
      });
    }

    // Add selections
    if (input.sceneSelection) parts.push(input.sceneSelection);
    if (input.poseSelection) parts.push(input.poseSelection);
    if (input.lightingSelection) parts.push(input.lightingSelection);
    if (input.styleSelection) parts.push(input.styleSelection);

    // Add custom prompt
    if (input.customPrompt) parts.push(input.customPrompt);

    // Add negative prompt
    if (input.negativePrompt) negativeParts.push(input.negativePrompt);

    // Combine
    let positivePrompt = parts.join(', ');
    let negativePrompt = negativeParts.join(', ');

    // Replace variables
    if (input.variables) {
      Object.entries(input.variables).forEach(([key, value]) => {
        const regex = new RegExp(`{${key}}`, 'g');
        positivePrompt = positivePrompt.replace(regex, value);
        negativePrompt = negativePrompt.replace(regex, value);
      });
    }

    return {
      positive: positivePrompt,
      negative: negativePrompt,
    };
  }

  // Bulk operations
  async bulkUpdateTemplates(
    ids: number[],
    data: { isActive?: boolean; tags?: string[] },
  ) {
    return this.prisma.promptTemplate.updateMany({
      where: { id: { in: ids } },
      data,
    });
  }

  async exportTemplates(ids?: number[]) {
    const where = ids ? { id: { in: ids } } : {};
    return this.prisma.promptTemplate.findMany({
      where,
      include: {
        versions: true,
      },
    });
  }

  async importTemplates(templates: any[], createdBy?: number) {
    const created: any[] = [];
    for (const template of templates) {
      const newTemplate = await this.createTemplate({
        ...template,
        createdBy,
      });
      created.push(newTemplate);
    }
    return created;
  }
}
