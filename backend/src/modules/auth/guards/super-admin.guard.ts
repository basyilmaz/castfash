import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('SuperAdminGuard - user:', user);
    console.log('SuperAdminGuard - isSuperAdmin:', user?.isSuperAdmin);

    if (!user || !user.isSuperAdmin) {
      console.log('SuperAdminGuard - REJECTED: No user or not super admin');
      throw new ForbiddenException('Super Admin access required');
    }

    console.log('SuperAdminGuard - ALLOWED');
    return true;
  }
}
