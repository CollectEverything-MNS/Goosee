import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JsonWebTokenError,
  JwtPayload,
  SignOptions,
  TokenExpiredError,
  decode,
  sign,
  verify,
} from 'jsonwebtoken';
import { JwtTokenPayload } from '../types/jwt-payload.type';

interface TokenClaims {
  sub: string;
  email: string;
  roles: string[];
  tokenVersion: number;
}

@Injectable()
export class JwtTokenService {
  constructor(private readonly config: ConfigService) {}

  generateAccessToken(claims: TokenClaims): { token: string; expiredAt: Date } {
    const token = sign(
      {
        sub: claims.sub,
        email: claims.email,
        roles: claims.roles,
        tokenVersion: claims.tokenVersion,
        typ: 'access',
      },
      this.getAccessSecret(),
      { expiresIn: this.getAccessExpiresIn() } as SignOptions,
    );

    return {
      token,
      expiredAt: this.decodeExpiration(token),
    };
  }

  generateRefreshToken(claims: TokenClaims): { token: string; expiredAt: Date } {
    const token = sign(
      {
        sub: claims.sub,
        email: claims.email,
        roles: claims.roles,
        tokenVersion: claims.tokenVersion,
        typ: 'refresh',
      },
      this.getRefreshSecret(),
      { expiresIn: this.getRefreshExpiresIn() } as SignOptions,
    );

    return {
      token,
      expiredAt: this.decodeExpiration(token),
    };
  }

  verifyRefreshToken(token: string): JwtTokenPayload {
    try {
      const payload = verify(token, this.getRefreshSecret()) as unknown as JwtTokenPayload;
      if (
        !payload.sub ||
        !payload.email ||
        !Array.isArray(payload.roles) ||
        typeof payload.tokenVersion !== 'number'
      ) {
        throw new UnauthorizedException('Invalid token payload');
      }
      if (payload.typ !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }
      return payload;
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

  private decodeExpiration(token: string): Date {
    const payload = decode(token) as JwtPayload | null;
    if (!payload?.exp) {
      throw new UnauthorizedException('Unable to compute token expiration');
    }
    return new Date(payload.exp * 1000);
  }

  private getAccessSecret(): string {
    return this.config.get<string>('JWT_ACCESS_SECRET') ?? this.getJwtSecretFallback();
  }

  private getRefreshSecret(): string {
    return this.config.get<string>('JWT_REFRESH_SECRET') ?? this.getJwtSecretFallback();
  }

  private getJwtSecretFallback(): string {
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('JWT secret is not configured');
    }
    return secret;
  }

  private getAccessExpiresIn(): string {
    return this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
  }

  private getRefreshExpiresIn(): string {
    return this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';
  }
}
