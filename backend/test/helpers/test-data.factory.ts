import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export class TestDataFactory {
  constructor(private prisma: PrismaService) {}

  async createUser(data?: { email?: string; password?: string }) {
    const email = data?.email || `test-${Date.now()}@example.com`;
    const password = data?.password || 'password123';
    const passwordHash = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });
  }

  async createOrganization(data?: {
    name?: string;
    ownerId?: number;
    remainingCredits?: number;
  }) {
    return this.prisma.organization.create({
      data: {
        name: data?.name || `Test Org ${Date.now()}`,
        ownerId: data?.ownerId || 1,
        remainingCredits: data?.remainingCredits ?? 100,
      },
    });
  }

  async createOrganizationUser(data: {
    userId: number;
    organizationId: number;
    role?: 'OWNER' | 'MEMBER';
  }) {
    return this.prisma.organizationUser.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        role: data.role || 'OWNER',
      },
    });
  }

  async createProduct(data: {
    organizationId: number;
    categoryId: number;
    name?: string;
    productImageUrl?: string;
  }) {
    return this.prisma.product.create({
      data: {
        organizationId: data.organizationId,
        categoryId: data.categoryId,
        name: data.name || `Test Product ${Date.now()}`,
        productImageUrl:
          data.productImageUrl || 'https://example.com/product.jpg',
      },
    });
  }

  async createProductCategory(data?: { name?: string }) {
    return this.prisma.productCategory.create({
      data: {
        name: data?.name || `Category ${Date.now()}`,
      },
    });
  }

  async createModelProfile(data: {
    organizationId: number;
    name?: string;
    gender?: 'FEMALE' | 'MALE';
  }) {
    return this.prisma.modelProfile.create({
      data: {
        organizationId: data.organizationId,
        name: data.name || `Model ${Date.now()}`,
        gender: data.gender || 'FEMALE',
      },
    });
  }

  async createScenePreset(data?: {
    organizationId?: number | null;
    name?: string;
    type?: 'PRESET' | 'SOLID_COLOR';
  }) {
    return this.prisma.scenePreset.create({
      data: {
        organizationId: data?.organizationId,
        name: data?.name || `Scene ${Date.now()}`,
        type: data?.type || 'PRESET',
      },
    });
  }

  async createUserWithOrganization(data?: {
    email?: string;
    password?: string;
    organizationName?: string;
  }) {
    const user = await this.createUser({
      email: data?.email,
      password: data?.password,
    });

    const organization = await this.createOrganization({
      name: data?.organizationName,
      ownerId: user.id,
    });

    await this.createOrganizationUser({
      userId: user.id,
      organizationId: organization.id,
      role: 'OWNER',
    });

    return { user, organization };
  }

  async cleanup() {
    // Delete in correct order to respect foreign key constraints
    await this.prisma.generatedImage.deleteMany();
    await this.prisma.generationRequest.deleteMany();
    await this.prisma.creditTransaction.deleteMany();
    await this.prisma.organizationUser.deleteMany();
    await this.prisma.product.deleteMany();
    await this.prisma.modelProfile.deleteMany();
    await this.prisma.scenePreset.deleteMany();
    await this.prisma.organization.deleteMany();
    await this.prisma.user.deleteMany();
  }
}
