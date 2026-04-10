import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from './jwt-payload.type';
import { ROLES_KEY } from './roles.decorator';
import { RoleAccessService } from './role-access.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly roleAccessService: RoleAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPageKeys = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPageKeys?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const userRoles = request.user?.roles ?? [];

    if (!userRoles.length) {
      throw new ForbiddenException('Insufficient role');
    }

    const allowedPageKeys = await this.roleAccessService.getAllowedPageKeys(userRoles);
    const hasAccess = requiredPageKeys.every((pageKey) => allowedPageKeys.has(pageKey));

    if (!hasAccess) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
