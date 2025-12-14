import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all products for an organization', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', organizationId: 1 },
        { id: 2, name: 'Product 2', organizationId: 1 },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll(1);

      expect(result).toHaveLength(2);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: 1 },
        }),
      );
    });

    it('should return empty array when no products exist', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      const result = await service.findAll(1);

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        organizationId: 1,
        description: 'A test product',
      };

      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findFirst).toHaveBeenCalledWith({
        where: { id: 1, organizationId: 1 },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue(null);

      await expect(service.findOne(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createDto = {
        name: 'New Product',
        description: 'A new product description',
      };

      const mockCreatedProduct = {
        id: 1,
        ...createDto,
        organizationId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.product.create.mockResolvedValue(mockCreatedProduct);

      const result = await service.create(1, createDto);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', createDto.name);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: 1,
          name: createDto.name,
        }),
      });
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto = {
        name: 'Updated Product Name',
      };

      const mockExisting = {
        id: 1,
        name: 'Old Name',
        organizationId: 1,
      };

      const mockUpdated = {
        ...mockExisting,
        name: updateDto.name,
      };

      mockPrismaService.product.findFirst.mockResolvedValue(mockExisting);
      mockPrismaService.product.update.mockResolvedValue(mockUpdated);

      const result = await service.update(1, 1, updateDto);

      expect(result).toHaveProperty('name', updateDto.name);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          name: updateDto.name,
        }),
      });
    });

    it('should throw NotFoundException when updating non-existent product', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue(null);

      await expect(
        service.update(1, 999, { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const mockProduct = {
        id: 1,
        name: 'Product to Delete',
        organizationId: 1,
      };

      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      await service.remove(1, 1);

      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when deleting non-existent product', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue(null);

      await expect(service.remove(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('count', () => {
    it('should return the count of products for an organization', async () => {
      mockPrismaService.product.count.mockResolvedValue(5);

      const result = await service.count(1);

      expect(result).toBe(5);
      expect(mockPrismaService.product.count).toHaveBeenCalledWith({
        where: { organizationId: 1 },
      });
    });
  });
});
