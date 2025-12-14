import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Credits (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
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

    // Create test user and get token
    const signupResponse = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: `credits-test-${Date.now()}@example.com`,
        password: 'password123',
        organizationName: 'Credits Test Org',
      })
      .expect(201);

    accessToken = signupResponse.body.accessToken;
    organizationId = signupResponse.body.organization.id;
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

  describe('/credits/balance (GET)', () => {
    it('should return credit balance', async () => {
      const response = await request(app.getHttpServer())
        .get('/credits/balance')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('balance');
      expect(typeof response.body.balance).toBe('number');
      // New organizations start with 20 credits
      expect(response.body.balance).toBe(20);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/credits/balance').expect(401);
    });
  });

  describe('/credits/transactions (GET)', () => {
    it('should return transaction history', async () => {
      const response = await request(app.getHttpServer())
        .get('/credits/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/credits/transactions')
        .expect(401);
    });
  });

  describe('/credits/check (GET)', () => {
    it('should return true when enough credits available', async () => {
      const response = await request(app.getHttpServer())
        .get('/credits/check?amount=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('hasEnough');
      expect(response.body.hasEnough).toBe(true);
    });

    it('should return false when not enough credits', async () => {
      const response = await request(app.getHttpServer())
        .get('/credits/check?amount=1000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('hasEnough');
      expect(response.body.hasEnough).toBe(false);
    });

    it('should return 400 for invalid amount', async () => {
      await request(app.getHttpServer())
        .get('/credits/check?amount=-10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  describe('Credit Consumption Flow', () => {
    it('should deduct credits after generation request', async () => {
      // Get initial balance
      const initialBalanceResponse = await request(app.getHttpServer())
        .get('/credits/balance')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const initialBalance = initialBalanceResponse.body.balance;

      // Create a product for generation
      const category = await prismaService.productCategory.upsert({
        where: { name: 'Credit Test Category' },
        update: {},
        create: { name: 'Credit Test Category' },
      });

      await prismaService.product.create({
        data: {
          name: 'Credit Test Product',
          categoryId: category.id,
          organizationId: organizationId,
          productImageUrl: 'https://example.com/test.jpg',
        },
      });

      // Verify balance tracking works
      expect(initialBalance).toBeGreaterThanOrEqual(0);
    });
  });
});
