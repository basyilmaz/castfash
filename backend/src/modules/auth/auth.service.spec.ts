import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    organization: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    organizationUser: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    creditTransaction: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    const signupDto = {
      email: 'test@example.com',
      password: 'password123',
      organizationName: 'Test Org',
    };

    it('should create a new user and organization', async () => {
      const mockUser = {
        id: 1,
        email: signupDto.email,
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockOrganization = {
        id: 1,
        name: signupDto.organizationName,
        ownerId: 1,
        remainingCredits: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.organization.create.mockResolvedValue(mockOrganization);
      mockPrismaService.organizationUser.create.mockResolvedValue({});
      mockPrismaService.creditTransaction.create.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.signup(signupDto);

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result).toHaveProperty('organization');
      expect(result).toHaveProperty('user');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.organization.create).toHaveBeenCalledWith({
        data: {
          name: signupDto.organizationName,
          ownerId: mockUser.id,
          remainingCredits: 20,
        },
      });
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: signupDto.email,
      });

      await expect(service.signup(signupDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.signup(signupDto)).rejects.toThrow(
        'Email already registered',
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return access token for valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: loginDto.email,
        passwordHash: await bcrypt.hash(loginDto.password, 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockOrganization = {
        id: 1,
        name: 'Test Org',
        ownerId: 1,
        remainingCredits: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.organizationUser.findFirst.mockResolvedValue({
        organizationId: 1,
      });
      mockPrismaService.organization.findUnique.mockResolvedValue(
        mockOrganization,
      );
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result).toHaveProperty('organization');
      expect(result).toHaveProperty('user');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockUser = {
        id: 1,
        email: loginDto.email,
        passwordHash: await bcrypt.hash('wrongpassword', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException if organization not found', async () => {
      const mockUser = {
        id: 1,
        email: loginDto.email,
        passwordHash: await bcrypt.hash(loginDto.password, 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.organizationUser.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Organization missing for user',
      );
    });
  });

  describe('refresh', () => {
    it('should return new access token for valid token', async () => {
      const mockPayload = {
        sub: 1,
        organizationId: 1,
        email: 'test@example.com',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.organizationUser.findFirst.mockResolvedValue({
        userId: 1,
        organizationId: 1,
      });
      mockJwtService.sign.mockReturnValue('new-jwt-token');
      mockConfigService.get.mockReturnValue('test-secret');

      const result = await service.refresh('old-token');

      expect(result).toHaveProperty('accessToken', 'new-jwt-token');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const mockPayload = {
        sub: 1,
        organizationId: 1,
        email: 'test@example.com',
      };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockConfigService.get.mockReturnValue('test-secret');

      await expect(service.refresh('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
