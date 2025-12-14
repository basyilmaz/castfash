import { Test, TestingModule } from '@nestjs/testing';
import { GenerationService } from './generation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AiImageService } from '../../ai-image/ai-image.service';
import { CreditsService } from '../credits/credits.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreditType, GenerationStatus, ViewType } from '@prisma/client';

describe('GenerationService', () => {
  let service: GenerationService;
  let prismaService: jest.Mocked<PrismaService>;
  let aiImageService: jest.Mocked<AiImageService>;
  let creditsService: jest.Mocked<CreditsService>;

  const mockProduct = {
    id: 1,
    organizationId: 1,
    name: 'Test Product',
    sku: 'TEST-001',
    categoryId: 1,
    productImageUrl: 'https://example.com/product.jpg',
    productBackImageUrl: 'https://example.com/product-back.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockModelProfile = {
    id: 1,
    organizationId: 1,
    name: 'Test Model',
    gender: 'FEMALE',
    faceReferenceUrl: 'https://example.com/face.jpg',
    frontPrompt: 'A professional model wearing the product',
    backPrompt: 'Back view of the model',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockScenePreset = {
    id: 1,
    organizationId: null,
    name: 'Studio White',
    type: 'PRESET',
    prompt: 'Professional studio with white background',
    backgroundReferenceUrl: 'https://example.com/bg.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrganization = {
    id: 1,
    name: 'Test Org',
    ownerId: 1,
    remainingCredits: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrisma = {
      product: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      organization: {
        findUnique: jest.fn(),
      },
      modelProfile: {
        findFirst: jest.fn(),
      },
      scenePreset: {
        findFirst: jest.fn(),
      },
      generationRequest: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      generatedImage: {
        createMany: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const mockAiImageService = {
      generateForOrganization: jest.fn(),
    };

    const mockCreditsService = {
      hasEnoughCredits: jest.fn(),
      getBalance: jest.fn(),
      deductCredits: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiImageService, useValue: mockAiImageService },
        { provide: CreditsService, useValue: mockCreditsService },
      ],
    }).compile();

    service = module.get<GenerationService>(GenerationService);
    prismaService = module.get(PrismaService);
    aiImageService = module.get(AiImageService);
    creditsService = module.get(CreditsService);
  });

  describe('getTokenCostPerImage', () => {
    it('should return correct token costs for each quality mode', () => {
      // Access private method through any cast
      const getTokenCost = (service as any).getTokenCostPerImage.bind(service);

      expect(getTokenCost('FAST')).toBe(3);
      expect(getTokenCost('STANDARD')).toBe(5);
      expect(getTokenCost('HIGH')).toBe(8);
      expect(getTokenCost('UNKNOWN')).toBe(5); // Default to STANDARD
    });
  });

  describe('generate', () => {
    const generateDto = {
      modelProfileId: 1,
      scenePresetId: 1,
      frontCount: 2,
      backCount: 1,
      aspectRatio: '9:16',
      resolution: '4K',
      qualityMode: 'STANDARD',
    };

    beforeEach(() => {
      prismaService.product.findFirst = jest
        .fn()
        .mockResolvedValue(mockProduct);
      prismaService.organization.findUnique = jest
        .fn()
        .mockResolvedValue(mockOrganization);
      prismaService.modelProfile.findFirst = jest
        .fn()
        .mockResolvedValue(mockModelProfile);
      prismaService.scenePreset.findFirst = jest
        .fn()
        .mockResolvedValue(mockScenePreset);
      creditsService.hasEnoughCredits = jest.fn().mockResolvedValue(true);
      creditsService.getBalance = jest.fn().mockResolvedValue(100);
    });

    it('should throw NotFoundException if product not found', async () => {
      prismaService.product.findFirst = jest.fn().mockResolvedValue(null);

      await expect(service.generate(1, 1, generateDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if no images requested', async () => {
      await expect(
        service.generate(1, 1, {
          ...generateDto,
          frontCount: 0,
          backCount: 0,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if not enough credits', async () => {
      creditsService.hasEnoughCredits = jest.fn().mockResolvedValue(false);
      creditsService.getBalance = jest.fn().mockResolvedValue(5);

      await expect(service.generate(1, 1, generateDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if model profile not found', async () => {
      prismaService.modelProfile.findFirst = jest.fn().mockResolvedValue(null);

      await expect(service.generate(1, 1, generateDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if scene preset not found', async () => {
      prismaService.scenePreset.findFirst = jest.fn().mockResolvedValue(null);

      await expect(service.generate(1, 1, generateDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getRequest', () => {
    const mockRequest = {
      id: 1,
      organizationId: 1,
      productId: 1,
      status: GenerationStatus.DONE,
      generatedImages: [],
    };

    it('should return generation request', async () => {
      prismaService.generationRequest.findFirst = jest
        .fn()
        .mockResolvedValue(mockRequest);

      const result = await service.getRequest(1, 1);
      expect(result).toEqual(mockRequest);
    });

    it('should throw NotFoundException if request not found', async () => {
      prismaService.generationRequest.findFirst = jest
        .fn()
        .mockResolvedValue(null);

      await expect(service.getRequest(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if organization mismatch', async () => {
      prismaService.generationRequest.findFirst = jest.fn().mockResolvedValue({
        ...mockRequest,
        organizationId: 2,
      });

      await expect(service.getRequest(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('listRecent', () => {
    it('should return recent generation requests', async () => {
      const mockRequests = [
        { id: 1, productId: 1, generatedImages: [] },
        { id: 2, productId: 2, generatedImages: [] },
      ];

      prismaService.generationRequest.findMany = jest
        .fn()
        .mockResolvedValue(mockRequests);

      const result = await service.listRecent(1, 5);
      expect(result).toEqual(mockRequests);
      expect(prismaService.generationRequest.findMany).toHaveBeenCalledWith({
        where: { organizationId: 1 },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: expect.any(Object),
      });
    });

    it('should use default take value', async () => {
      prismaService.generationRequest.findMany = jest
        .fn()
        .mockResolvedValue([]);

      await service.listRecent(1);
      expect(prismaService.generationRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });
  });

  describe('listGenerations', () => {
    it('should return paginated generations list', async () => {
      const mockItems = [
        {
          id: 1,
          createdAt: new Date(),
          productId: 1,
          product: { name: 'Product 1', productImageUrl: 'url1' },
          modelProfile: { name: 'Model 1' },
          scenePreset: { name: 'Scene 1' },
          frontCount: 2,
          backCount: 1,
          frontError: null,
          backError: null,
          generatedImages: [
            { viewType: ViewType.FRONT },
            { viewType: ViewType.FRONT },
            { viewType: ViewType.BACK },
          ],
        },
      ];

      prismaService.$transaction = jest.fn().mockResolvedValue([1, mockItems]);

      const result = await service.listGenerations(1, {
        page: 1,
        pageSize: 20,
      });

      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].frontImagesCount).toBe(2);
      expect(result.items[0].backImagesCount).toBe(1);
    });

    it('should filter by productId', async () => {
      prismaService.$transaction = jest.fn().mockResolvedValue([0, []]);

      await service.listGenerations(1, { productId: 5 });

      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('getGenerationDetail', () => {
    it('should return detailed generation info', async () => {
      const mockDetail = {
        id: 1,
        organizationId: 1,
        createdAt: new Date(),
        product: { id: 1, name: 'Product' },
        modelProfile: { id: 1, name: 'Model' },
        scenePreset: { id: 1, name: 'Scene' },
        frontCount: 2,
        backCount: 1,
        frontError: null,
        backError: null,
        generatedImages: [
          { id: 1, viewType: ViewType.FRONT },
          { id: 2, viewType: ViewType.BACK },
        ],
      };

      prismaService.generationRequest.findFirst = jest
        .fn()
        .mockResolvedValue(mockDetail);

      const result = await service.getGenerationDetail(1, 1);

      expect(result.id).toBe(1);
      expect(result.frontImages).toHaveLength(1);
      expect(result.backImages).toHaveLength(1);
    });

    it('should throw NotFoundException if not found', async () => {
      prismaService.generationRequest.findFirst = jest
        .fn()
        .mockResolvedValue(null);

      await expect(service.getGenerationDetail(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('previewPrompt', () => {
    it('should return preview prompts', async () => {
      prismaService.product.findFirst = jest
        .fn()
        .mockResolvedValue(mockProduct);
      prismaService.modelProfile.findFirst = jest
        .fn()
        .mockResolvedValue(mockModelProfile);
      prismaService.scenePreset.findFirst = jest
        .fn()
        .mockResolvedValue(mockScenePreset);

      const result = await service.previewPrompt(1, {
        productId: 1,
        modelProfileId: 1,
        scenePresetId: 1,
      } as any);

      expect(result).toHaveProperty('front');
      expect(result).toHaveProperty('back');
    });

    it('should throw NotFoundException if product not found', async () => {
      prismaService.product.findFirst = jest.fn().mockResolvedValue(null);

      await expect(
        service.previewPrompt(1, { productId: 999 } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('runBatch', () => {
    const batchDto = {
      productId: '1',
      jobs: [
        {
          modelProfileId: '1',
          sceneId: '1',
          frontCount: 1,
          backCount: 0,
          aspectRatio: '9:16',
          resolution: '4K',
          quality: 'STANDARD',
        },
      ],
    };

    it('should return error for invalid job with zero counts', async () => {
      prismaService.product.findFirst = jest
        .fn()
        .mockResolvedValue(mockProduct);

      const result = await service.runBatch(1, {
        productId: '1',
        jobs: [
          {
            modelProfileId: '1',
            sceneId: '1',
            frontCount: 0,
            backCount: 0,
            aspectRatio: '9:16',
            resolution: '4K',
            quality: 'STANDARD',
          },
        ],
      } as any);

      expect(result.results[0].errors).toBeDefined();
    });

    it('should throw NotFoundException if product not found', async () => {
      prismaService.product.findFirst = jest.fn().mockResolvedValue(null);

      await expect(service.runBatch(1, batchDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
