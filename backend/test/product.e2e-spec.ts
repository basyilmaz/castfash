import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestDataFactory } from './helpers/test-data.factory';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let factory: TestDataFactory;
  let accessToken: string;
  let organizationId: number;

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
    factory = new TestDataFactory(prismaService);

    // Create test user and organization
    const { user, organization } = await factory.createUserWithOrganization({
      email: `product-test-${Date.now()}@example.com`,
      organizationName: 'Product Test Org',
    });
    organizationId = organization.id;

    // Login to get token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: 'password123',
      });
    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await factory.cleanup();
    await app.close();
  });

  describe('/products (POST)', () => {
    it('should create a new product', async () => {
      const category = await factory.createProductCategory({
        name: `Test Category ${Date.now()}`,
      });

      const createProductDto = {
        name: 'New Product',
        categoryId: category.id,
        productImageUrl: 'https://example.com/image.jpg',
      };

      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createProductDto)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(createProductDto.name);
          expect(res.body.organizationId).toBe(organizationId);
        });
    });

    it('should fail without auth token', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Fail Product' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/products (GET)', () => {
    it('should return list of products', async () => {
      // Create a product first
      const category = await factory.createProductCategory({
        name: `List Category ${Date.now()}`,
      });
      await factory.createProduct({
        organizationId,
        categoryId: category.id,
        name: 'List Product',
      });

      return request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('name');
        });
    });
  });

  describe('/products/:id (GET)', () => {
    it('should return a single product', async () => {
      const category = await factory.createProductCategory({
        name: `Single Category ${Date.now()}`,
      });
      const product = await factory.createProduct({
        organizationId,
        categoryId: category.id,
        name: 'Single Product',
      });

      return request(app.getHttpServer())
        .get(`/products/${product.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.id).toBe(product.id);
          expect(res.body.name).toBe(product.name);
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/products/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('/products/:id (PATCH)', () => {
    it('should update a product', async () => {
      const category = await factory.createProductCategory({
        name: `Update Category ${Date.now()}`,
      });
      const product = await factory.createProduct({
        organizationId,
        categoryId: category.id,
        name: 'Old Name',
      });

      return request(app.getHttpServer())
        .patch(`/products/${product.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.id).toBe(product.id);
          expect(res.body.name).toBe('Updated Name');
        });
    });
  });

  describe('/products/:id (DELETE)', () => {
    it('should delete a product', async () => {
      const category = await factory.createProductCategory({
        name: `Delete Category ${Date.now()}`,
      });
      const product = await factory.createProduct({
        organizationId,
        categoryId: category.id,
        name: 'Delete Me',
      });

      await request(app.getHttpServer())
        .delete(`/products/${product.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/products/${product.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
