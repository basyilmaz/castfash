import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from './jwt-payload.interface';
import { RequestUser } from '../../common/types/request-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', ''),
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    const membership = await this.prisma.organizationUser.findFirst({
      where: { userId: user.id, organizationId: payload.organizationId },
    });

    if (!membership) {
      throw new UnauthorizedException();
    }

    return {
      userId: user.id,
      organizationId: payload.organizationId,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    };
  }
}
