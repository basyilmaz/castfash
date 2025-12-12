import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same configuration as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Cleanup test data in correct order to respect foreign key constraints
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

  describe('/auth/signup (POST)', () => {
    it('should create a new user and organization', () => {
      const signupDto = {
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        organizationName: 'Test Organization',
      };

      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('organization');
          expect(res.body.user.email).toBe(signupDto.email);
          expect(res.body.organization.name).toBe(signupDto.organizationName);
          expect(res.body.organization.remainingCredits).toBe(20);
        });
    });

    it('should return 400 for duplicate email', async () => {
      const signupDto = {
        email: `duplicate-${Date.now()}@example.com`,
        password: 'password123',
        organizationName: 'Test Organization',
      };

      // First signup
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(201);

      // Second signup with same email
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Email already registered');
        });
    });

    it('should return 400 for invalid email', () => {
      const signupDto = {
        email: 'invalid-email',
        password: 'password123',
        organizationName: 'Test Organization',
      };

      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(400);
    });

    it('should return 400 for missing fields', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          // missing password and organizationName
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    const testUser = {
      email: `login-test-${Date.now()}@example.com`,
      password: 'password123',
      organizationName: 'Login Test Org',
    };

    beforeAll(async () => {
      // Create test user
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(201);
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('organization');
          expect(res.body.user.email).toBe(testUser.email);
        });
    });

    it('should return 401 for invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should return 401 for non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });
  });

  describe('/me/organization (GET)', () => {
    let accessToken: string;

    beforeAll(async () => {
      const signupDto = {
        email: `me-test-${Date.now()}@example.com`,
        password: 'password123',
        organizationName: 'Me Test Org',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(201);

      accessToken = response.body.accessToken;
    });

    it('should return organization with valid token', () => {
      return request(app.getHttpServer())
        .get('/me/organization')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('organization');
          expect(res.body).toHaveProperty('role');
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer()).get('/me/organization').expect(401);
    });

    it('should return 401 with invalid token', () => {
      return request(app.getHttpServer())
        .get('/me/organization')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
