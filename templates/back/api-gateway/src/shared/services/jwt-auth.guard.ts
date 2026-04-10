import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, TokenExpiredError, verify } from 'jsonwebtoken';
import { JwtPayload } from './jwt-payload.type';
import { HttpProxyService } from './http-proxy.service';
import { serviceUrl } from '../../config/services.config';

type TokenVersionResponse = {
  tokenVersion: number;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly httpProxy: HttpProxyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined>; user?: JwtPayload }>();

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authHeader.slice(7);

    try {
      const payload = verify(token, this.getAccessSecret()) as JwtPayload;
      if (payload.typ !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }
      if (typeof payload.tokenVersion !== 'number') {
        throw new UnauthorizedException('Invalid token payload');
      }

      await this.assertTokenVersion(payload.sub, payload.tokenVersion);

      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      throw error;
    }
  }

  private getAccessSecret(): string {
    const secret =
      this.config.get<string>('JWT_ACCESS_SECRET') ?? this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('JWT secret is not configured');
    }
    return secret;
  }

  private async assertTokenVersion(authId: string, tokenVersion: number): Promise<void> {
    try {
      const authServiceUrl = serviceUrl(this.config).auth;
      const response = await this.httpProxy.get<TokenVersionResponse>(
        `${authServiceUrl}/auth/token-version/${authId}`,
        'Resolve token version failed',
      );

      if (response.tokenVersion !== tokenVersion) {
        throw new UnauthorizedException('Token revoked');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof HttpException && error.getStatus() === 404) {
        throw new UnauthorizedException('User not found');
      }
      throw error;
    }
  }
}
