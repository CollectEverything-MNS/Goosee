import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

// Protège les endpoints internes (appelés de service à service via le réseau du tenant).
@Injectable()
export class InternalTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['x-internal-token'];
    const expected = process.env.INTERNAL_API_TOKEN;
    if (!expected || token !== expected) {
      throw new UnauthorizedException('Jeton interne invalide');
    }
    return true;
  }
}
