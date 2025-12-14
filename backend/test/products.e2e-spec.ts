import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;
  let organizationId: number;
  let testProductId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);

    // Create test user and get token
    const signupResponse = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: `product-test-${Date.now()}@example.com`,
        password: 'password123',
        organizationName: 'Product Test Org',
      })
      .expect(201);

    accessToken = signupResponse.body.accessToken;
    organizationId = signupResponse.body.organization.id;

    // Create a test category
    await prismaService.productCategory.upsert({
      where: { name: 'Test Category' },
      update: {},
      create: { name: 'Test Category' },
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await prismaService.generatedImage.deleteMany();
    await prismaService.generationRequest.deleteMany();
    await prismaService.creditTransaction.deleteMany();
    await prismaService.product.deleteMany();
    await prismaService.modelProfile.deleteMany();
    await prismaService.scenePreset.deleteMany();
    await prismaService.organizationUser.deleteMany();
    await prismaService.organization.deleteMany();
    await prismaService.user.deleteMany();

    await app.close();
  });

  describe('/products (POST)', () => {
    it('should create a new product', async () => {
      const category = await prismaService.productCategory.findFirst({
        where: { name: 'Test Category' },
      });

      const createProductDto = {
        name: 'Test Product',
        sku: 'TEST-001',
        categoryId: category?.id || 1,
        productImageUrl: 'https://example.com/image.jpg',
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createProductDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createProductDto.name);
      expect(response.body.sku).toBe(createProductDto.sku);

      testProductId = response.body.id;
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          categoryId: 1,
          productImageUrl: 'https://example.com/image.jpg',
        })
        .expect(401);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test Product',
          // Missing categoryId and productImageUrl
        })
        .expect(400);
    });
  });

  describe('/products (GET)', () => {
    it('should return list of products', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/products').expect(401);
    });
  });

  describe('/products/:id (GET)', () => {
    it('should return product by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/${testProductId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(testProductId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('category');
    });

    it('should return 404 for non-existent product', async () => {
      await request(app.getHttpServer())
        .get('/products/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/products/:id (PUT)', () => {
    it('should update product', async () => {
      const updateDto = {
        name: 'Updated Product Name',
        sku: 'UPDATED-001',
      };

      const response = await request(app.getHttpServer())
        .put(`/products/${testProductId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
      expect(response.body.sku).toBe(updateDto.sku);
    });

    it('should return 404 for non-existent product', async () => {
      await request(app.getHttpServer())
        .put('/products/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('/products/:id (DELETE)', () => {
    it('should delete product', async () => {
      // Create a product to delete
      const category = await prismaService.productCategory.findFirst();
      const product = await prismaService.product.create({
        data: {
          name: 'Product to Delete',
          categoryId: category!.id,
          organizationId: organizationId,
          productImageUrl: 'https://example.com/delete.jpg',
        },
      });

      await request(app.getHttpServer())
        .delete(`/products/${product.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify deletion
      const deleted = await prismaService.product.findUnique({
        where: { id: product.id },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent product', async () => {
      await request(app.getHttpServer())
        .delete('/products/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
