import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateModelProfileDto } from './dto/create-model-profile.dto';
import { assertOrgMatch } from '../../common/utils/org-check';
import { AiImageService } from '../../ai-image/ai-image.service';
import { CreditsService } from '../credits/credits.service';
import { AssetType, CreditType } from '@prisma/client';

@Injectable()
export class ModelProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiImageService: AiImageService,
    private readonly creditsService: CreditsService,
  ) {}

  findAll(organizationId: number) {
    return this.prisma.modelProfile.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: number, id: number) {
    const profile = await this.prisma.modelProfile.findUnique({
      where: { id },
    });
    if (!profile) {
      throw new NotFoundException('Model profile not found');
    }
    assertOrgMatch(profile.organizationId, organizationId);
    return profile;
  }

  create(organizationId: number, dto: CreateModelProfileDto) {
    return this.prisma.modelProfile.create({
      data: { ...dto, organizationId },
    });
  }

  async update(organizationId: number, id: number, dto: CreateModelProfileDto) {
    const existing = await this.prisma.modelProfile.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Resource not found or not accessible');
    }
    assertOrgMatch(existing.organizationId, organizationId);

    return this.prisma.modelProfile.update({
      where: { id },
      data: { ...dto },
    });
  }

  async generateReferenceImage(
    organizationId: number,
    id: number,
    prompt: string,
    view: 'FACE' | 'BACK',
  ) {
    const profile = await this.findOne(organizationId, id);
    const cost = 1;

    // Check credits
    const hasCredits = await this.creditsService.hasEnoughCredits(
      organizationId,
      cost,
    );
    if (!hasCredits) {
      throw new BadRequestException(`Insufficient credits. Required: ${cost}`);
    }

    // Deduct credits
    await this.creditsService.deductCredits({
      organizationId,
      amount: cost,
      type: CreditType.MODEL_GENERATION,
      modelProfileId: id,
      note: `AI Model Generation (${view}) - ${profile.name}`,
    });

    try {
      // Get master prompt from settings
      // TODO: Uncomment when Setting model is added to schema
      /*
      const masterPrompt = await this.prisma.setting.findFirst({
        where: {
          organizationId,
          key: 'master_prompt'
        }
      });
      */
      const masterPrompt: { value?: string } | null = null; // Temporary: no master prompt

      // Build comprehensive prompt from profile attributes
      const physicalAttributes: string[] = [];

      if (profile.gender) physicalAttributes.push(profile.gender.toLowerCase());
      if (profile.ageRange) physicalAttributes.push(`age ${profile.ageRange}`);
      if (profile.bodyType)
        physicalAttributes.push(`${profile.bodyType} body type`);
      if (profile.skinTone)
        physicalAttributes.push(`${profile.skinTone} skin tone`);
      if (profile.hairColor)
        physicalAttributes.push(`${profile.hairColor} hair`);
      if (profile.hairStyle)
        physicalAttributes.push(`${profile.hairStyle} hairstyle`);

      // Build final prompt
      const viewSpecific =
        view === 'FACE' ? 'front view portrait' : 'back view full body';
      const basePrompt = `Professional model photo, ${viewSpecific}, ${physicalAttributes.join(', ')}`;

      // Add view-specific prompt if exists
      const viewPrompt =
        view === 'FACE' ? profile.frontPrompt : profile.backPrompt;
      const stylePrompt = profile.stylePrompt;

      // TODO: Add master prompt support when Setting model is added to schema
      const promptParts = [basePrompt];
      if (viewPrompt) promptParts.push(viewPrompt);
      if (stylePrompt) promptParts.push(stylePrompt);
      promptParts.push(prompt); // User's custom prompt

      const finalPrompt = promptParts.filter(Boolean).join(', ');

      // Generate image
      const imageUrl = await this.aiImageService.generateForOrganization(
        organizationId,
        {
          prompt: finalPrompt,
          aspectRatio: '9:16',
          resolution: '2K',
          qualityMode: 'STANDARD',
        },
      );

      // Update profile
      const updateData: any = {
        tokensSpentOnCreation: { increment: cost },
      };

      if (view === 'FACE') {
        updateData.faceReferenceUrl = imageUrl;
        updateData.faceReferenceType = AssetType.AI_GENERATED;
        updateData.frontPrompt = prompt;
      } else {
        updateData.backReferenceUrl = imageUrl;
        updateData.backReferenceType = AssetType.AI_GENERATED;
        updateData.backPrompt = prompt;
      }

      await this.prisma.modelProfile.update({
        where: { id },
        data: updateData,
      });

      return { imageUrl, tokensUsed: cost };
    } catch (error) {
      // Refund credits on failure
      await this.creditsService.addCredits(
        organizationId,
        cost,
        CreditType.ADJUST,
        `Refund for failed model generation (${view}) - ${profile.name}`,
      );
      throw error;
    }
  }
}
