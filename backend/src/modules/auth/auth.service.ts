import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { CreditType, UserRole } from '@prisma/client';
import { JwtPayload } from './jwt-payload.interface';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Generate email verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        verifyToken,
        verifyTokenExpiry,
        isEmailVerified: false,
      },
    });

    const organization = await this.prisma.organization.create({
      data: {
        name: dto.organizationName,
        ownerId: user.id,
        remainingCredits: 20,
      },
    });

    await this.prisma.organizationUser.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: UserRole.OWNER,
      },
    });

    await this.prisma.creditTransaction.create({
      data: {
        organizationId: organization.id,
        type: CreditType.ADJUST,
        amount: 20,
        note: 'Welcome credits',
      },
    });

    // Send verification email (don't await, let it run in background)
    this.emailService
      .sendVerificationEmail(user.email, verifyToken)
      .catch((err) => {
        console.error('Failed to send verification email:', err);
      });

    // Send welcome email
    this.emailService.sendWelcomeEmail(user.email).catch((err) => {
      console.error('Failed to send welcome email:', err);
    });

    return {
      accessToken: this.createToken(
        user.id,
        organization.id,
        user.email,
        user.isSuperAdmin || false,
      ),
      organization,
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const orgLink = await this.prisma.organizationUser.findFirst({
      where: { userId: user.id },
      select: { organizationId: true },
    });

    if (!orgLink) {
      throw new UnauthorizedException('Organization missing for user');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: orgLink.organizationId },
    });

    return {
      accessToken: this.createToken(
        user.id,
        orgLink.organizationId,
        user.email,
        user.isSuperAdmin || false,
      ),
      organization,
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isSuperAdmin: user.isSuperAdmin,
      },
    };
  }

  private createToken(
    userId: number,
    organizationId: number,
    email: string,
    isSuperAdmin: boolean = false,
  ) {
    const payload: JwtPayload = {
      sub: userId,
      organizationId,
      email,
      isSuperAdmin,
    };
    return this.jwtService.sign(payload);
  }

  async refresh(accessToken: string) {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(accessToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
        ignoreExpiration: false,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });
      if (!user) {
        throw new UnauthorizedException();
      }

      const membership = await this.prisma.organizationUser.findFirst({
        where: { userId: user.id, organizationId: decoded.organizationId },
      });
      if (!membership) {
        throw new UnauthorizedException();
      }

      return {
        accessToken: this.createToken(
          decoded.sub,
          decoded.organizationId,
          decoded.email,
          user.isSuperAdmin || false,
        ),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // ========== PASSWORD RESET ==========

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send reset email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Şifreniz başarıyla güncellendi' };
  }

  // ========== EMAIL VERIFICATION ==========

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Geçersiz veya süresi dolmuş doğrulama bağlantısı',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verifyToken: null,
        verifyTokenExpiry: null,
      },
    });

    return { message: 'E-posta adresiniz başarıyla doğrulandı' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { message: 'Doğrulama e-postası gönderildi' };
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('E-posta adresi zaten doğrulanmış');
    }

    // Generate new verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verifyToken,
        verifyTokenExpiry,
      },
    });

    await this.emailService.sendVerificationEmail(user.email, verifyToken);

    return { message: 'Doğrulama e-postası gönderildi' };
  }
}
