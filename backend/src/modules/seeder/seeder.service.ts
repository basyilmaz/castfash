import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SceneType, PromptType, PromptCategoryType } from '@prisma/client';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly prisma: PrismaService) { }

  async onModuleInit() {
    await this.ensureProductCategories();
    await this.ensureGlobalScenes();
    await this.ensureMasterPromptTemplates();
    await this.ensureDefaultPresets();
  }

  async ensureProductCategories() {
    const categories = ['bikini', 'dress', 'tshirt'];
    await Promise.all(
      categories.map((name) =>
        this.prisma.productCategory.upsert({
          where: { name },
          update: {},
          create: { name },
        }),
      ),
    );
    this.logger.log('Default product categories ensured.');
  }

  private async ensureGlobalScenes() {
    const scenes = [
      {
        name: 'Beach',
        type: SceneType.PRESET,
        backgroundReferenceUrl: 'https://picsum.photos/seed/beach/1080/1920',
      },
      {
        name: 'White Studio',
        type: SceneType.PRESET,
        backgroundReferenceUrl: 'https://picsum.photos/seed/studio/1080/1920',
      },
      {
        name: 'Soft Pink',
        type: SceneType.SOLID_COLOR,
        solidColorHex: '#fce4ec',
      },
    ];

    for (const scene of scenes) {
      const exists = await this.prisma.scenePreset.findFirst({
        where: { name: scene.name, organizationId: null },
      });
      if (!exists) {
        await this.prisma.scenePreset.create({
          data: { ...scene, organizationId: null },
        });
      }
    }
    this.logger.log('Global scenes ensured.');
  }

  private async ensureMasterPromptTemplates() {
    const templates = [
      // Master Templates
      {
        name: 'Fashion Product Master',
        type: PromptType.MASTER,
        category: PromptCategoryType.PRODUCT,
        content: 'Professional fashion product photography, {product_type}, {model_description}, wearing the product naturally, {scene_description}, {lighting}, {style}, high-end fashion magazine quality, 8k resolution, sharp details',
        variables: { product_type: '', model_description: '', scene_description: '', lighting: '', style: '' },
        priority: 100,
        tags: ['master', 'fashion', 'product'],
      },
      {
        name: 'E-commerce Product Master',
        type: PromptType.MASTER,
        category: PromptCategoryType.PRODUCT,
        content: 'Clean e-commerce product photo, {product_type}, professional model, {pose}, {background}, commercial photography, crisp and clear, product-focused, online store quality',
        variables: { product_type: '', pose: '', background: '' },
        priority: 90,
        tags: ['master', 'ecommerce', 'product'],
      },
      // Scene Templates
      {
        name: 'Beach Scene',
        type: PromptType.SCENE,
        category: PromptCategoryType.BACKGROUND,
        content: 'tropical beach setting, golden hour sunlight, ocean waves in background, palm trees, warm summer vibes',
        priority: 80,
        tags: ['scene', 'beach', 'outdoor'],
      },
      {
        name: 'Studio White',
        type: PromptType.SCENE,
        category: PromptCategoryType.BACKGROUND,
        content: 'clean white studio background, professional photography studio, minimalist setting',
        priority: 80,
        tags: ['scene', 'studio', 'white'],
      },
      {
        name: 'Urban Street',
        type: PromptType.SCENE,
        category: PromptCategoryType.BACKGROUND,
        content: 'urban city street, modern architecture, street fashion environment, contemporary setting',
        priority: 75,
        tags: ['scene', 'urban', 'street'],
      },
      // Pose Templates
      {
        name: 'Standing Confident',
        type: PromptType.POSE,
        category: PromptCategoryType.MODEL,
        content: 'standing confidently, one hand on hip, relaxed posture, looking at camera',
        priority: 70,
        tags: ['pose', 'standing', 'confident'],
      },
      {
        name: 'Walking Dynamic',
        type: PromptType.POSE,
        category: PromptCategoryType.MODEL,
        content: 'walking pose, dynamic movement, natural stride, fashion runway style',
        priority: 70,
        tags: ['pose', 'walking', 'dynamic'],
      },
      // Lighting Templates
      {
        name: 'Soft Natural',
        type: PromptType.LIGHTING,
        category: PromptCategoryType.QUALITY,
        content: 'soft natural lighting, diffused sunlight, no harsh shadows, flattering illumination',
        priority: 60,
        tags: ['lighting', 'natural', 'soft'],
      },
      {
        name: 'Studio Professional',
        type: PromptType.LIGHTING,
        category: PromptCategoryType.QUALITY,
        content: 'professional studio lighting, three-point lighting setup, even illumination, commercial quality',
        priority: 60,
        tags: ['lighting', 'studio', 'professional'],
      },
      {
        name: 'Golden Hour',
        type: PromptType.LIGHTING,
        category: PromptCategoryType.QUALITY,
        content: 'golden hour lighting, warm sunset glow, romantic atmosphere, soft shadows',
        priority: 55,
        tags: ['lighting', 'golden', 'warm'],
      },
      // Style Templates
      {
        name: 'High Fashion',
        type: PromptType.STYLE,
        category: PromptCategoryType.GENERAL,
        content: 'high fashion aesthetic, vogue magazine style, editorial quality, sophisticated',
        priority: 50,
        tags: ['style', 'fashion', 'editorial'],
      },
      {
        name: 'Casual Lifestyle',
        type: PromptType.STYLE,
        category: PromptCategoryType.GENERAL,
        content: 'casual lifestyle photography, authentic and relatable, everyday fashion',
        priority: 50,
        tags: ['style', 'casual', 'lifestyle'],
      },
      // Negative Prompt Template
      {
        name: 'Standard Negative',
        type: PromptType.NEGATIVE,
        category: PromptCategoryType.QUALITY,
        content: 'blurry, low quality, distorted, deformed, ugly, bad anatomy, wrong proportions, extra limbs, missing limbs, floating limbs, disconnected limbs, mutation, mutated, morbid, malformed, amateur, watermark, text, signature',
        priority: 100,
        tags: ['negative', 'standard'],
      },
    ];

    for (const template of templates) {
      const exists = await this.prisma.promptTemplate.findFirst({
        where: { name: template.name },
      });
      if (!exists) {
        await this.prisma.promptTemplate.create({
          data: {
            ...template,
            isActive: true,
          },
        });
      }
    }
    this.logger.log('Master prompt templates ensured.');
  }

  private async ensureDefaultPresets() {
    const presets = [
      {
        name: 'Beach Fashion',
        description: 'Perfect for swimwear and summer clothing',
        scenePrompt: 'tropical beach setting, golden hour sunlight, ocean waves',
        posePrompt: 'standing confidently, relaxed beach pose',
        lightingPrompt: 'golden hour lighting, warm natural light',
        stylePrompt: 'summer fashion editorial, vacation vibes',
        negativePrompt: 'blurry, low quality, distorted, deformed',
        tags: ['beach', 'summer', 'swimwear'],
      },
      {
        name: 'Studio Clean',
        description: 'Classic studio look for any product',
        scenePrompt: 'clean white studio background, professional setting',
        posePrompt: 'professional model pose, product-focused',
        lightingPrompt: 'professional studio lighting, soft and even',
        stylePrompt: 'commercial product photography, clean and crisp',
        negativePrompt: 'shadows, cluttered background, amateur',
        tags: ['studio', 'clean', 'professional'],
      },
      {
        name: 'Urban Street Style',
        description: 'Modern streetwear and casual fashion',
        scenePrompt: 'urban city street, graffiti walls, contemporary setting',
        posePrompt: 'street style pose, casual and confident',
        lightingPrompt: 'natural street lighting, dynamic shadows',
        stylePrompt: 'street fashion editorial, urban aesthetic',
        negativePrompt: 'blurry, low quality, unflattering angles',
        tags: ['urban', 'street', 'casual'],
      },
    ];

    for (const preset of presets) {
      const exists = await this.prisma.promptPreset.findFirst({
        where: { name: preset.name },
      });
      if (!exists) {
        await this.prisma.promptPreset.create({
          data: {
            ...preset,
            isActive: true,
          },
        });
      }
    }
    this.logger.log('Default prompt presets ensured.');
  }
}
