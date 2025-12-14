import { Test, TestingModule } from '@nestjs/testing';
import { CreditsService } from './credits.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { CreditType } from '@prisma/client';

describe('CreditsService', () => {
  let service: CreditsService;

  const mockPrismaService = {
    organization: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    creditTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CreditsService>(CreditsService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBalance', () => {
    it('should return the organization remaining credits', async () => {
      const mockOrg = {
        id: 1,
        remainingCredits: 100,
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrg);

      const result = await service.getBalance(1);

      expect(result).toBe(100);
      expect(mockPrismaService.organization.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { remainingCredits: true },
      });
    });

    it('should return 0 if organization not found', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      const result = await service.getBalance(999);

      expect(result).toBe(0);
    });
  });

  describe('hasEnoughCredits', () => {
    it('should return true when organization has enough credits', async () => {
      const mockOrg = { id: 1, remainingCredits: 100 };
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrg);

      const result = await service.hasEnoughCredits(1, 50);

      expect(result).toBe(true);
    });

    it('should return false when organization does not have enough credits', async () => {
      const mockOrg = { id: 1, remainingCredits: 10 };
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrg);

      const result = await service.hasEnoughCredits(1, 50);

      expect(result).toBe(false);
    });

    it('should return true when organization has exactly enough credits', async () => {
      const mockOrg = { id: 1, remainingCredits: 50 };
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrg);

      const result = await service.hasEnoughCredits(1, 50);

      expect(result).toBe(true);
    });
  });

  describe('addCredits', () => {
    it('should add credits to organization', async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          organization: {
            update: jest
              .fn()
              .mockResolvedValue({ id: 1, remainingCredits: 150 }),
          },
          creditTransaction: {
            create: jest.fn().mockResolvedValue({ id: 1 }),
          },
        };
        return callback(mockTx);
      });

      mockPrismaService.$transaction.mockImplementation(mockTransaction);

      await service.addCredits(1, 50, CreditType.PURCHASE, 'Test purchase');

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('deductCredits', () => {
    it('should deduct credits from organization', async () => {
      const mockOrg = { id: 1, remainingCredits: 100 };
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrg);

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          organization: {
            update: jest
              .fn()
              .mockResolvedValue({ id: 1, remainingCredits: 50 }),
          },
          creditTransaction: {
            create: jest.fn().mockResolvedValue({ id: 1 }),
          },
        };
        return callback(mockTx);
      });

      mockPrismaService.$transaction.mockImplementation(mockTransaction);

      await service.deductCredits({
        organizationId: 1,
        amount: 50,
        type: CreditType.PRODUCT_GENERATION,
        note: 'Test generation',
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException when insufficient credits', async () => {
      const mockOrg = { id: 1, remainingCredits: 10 };
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrg);

      await expect(
        service.deductCredits({
          organizationId: 1,
          amount: 50,
          type: CreditType.PRODUCT_GENERATION,
          note: 'Test generation',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTransactions', () => {
    it('should return transaction history for organization', async () => {
      const mockTransactions = [
        {
          id: 1,
          organizationId: 1,
          type: CreditType.PURCHASE,
          amount: 100,
          note: 'Initial purchase',
          createdAt: new Date(),
        },
        {
          id: 2,
          organizationId: 1,
          type: CreditType.PRODUCT_GENERATION,
          amount: -5,
          note: 'Image generation',
          createdAt: new Date(),
        },
      ];

      mockPrismaService.creditTransaction.findMany.mockResolvedValue(
        mockTransactions,
      );

      const result = await service.getTransactions(1);

      expect(result).toHaveLength(2);
      expect(mockPrismaService.creditTransaction.findMany).toHaveBeenCalledWith(
        {
          where: { organizationId: 1 },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      );
    });

    it('should respect limit parameter', async () => {
      mockPrismaService.creditTransaction.findMany.mockResolvedValue([]);

      await service.getTransactions(1, 10);

      expect(mockPrismaService.creditTransaction.findMany).toHaveBeenCalledWith(
        {
          where: { organizationId: 1 },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      );
    });
  });
});
