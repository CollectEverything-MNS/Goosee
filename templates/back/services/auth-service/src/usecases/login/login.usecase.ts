import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthToken, AUTH_TOKEN_TYPES } from '../../entities/auth-token.entity';
import { IAuthRepository } from '../../repositories/auth.repository';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';
import { LoginDto, LoginResponseDto } from './login.dto';
import { comparePassword } from '../../shared/utils';
import { JwtTokenService } from '../../shared/services/jwt-token.service';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly authTokenRepo: IAuthTokenRepository,
    private readonly jwtTokenService: JwtTokenService
  ) {}

  async execute(dto: LoginDto): Promise<LoginResponseDto> {
    const auth = await this.authRepo.findByEmail(dto.email);

    if (!auth) {
      throw new UnauthorizedException('User not found');
    }

    if (!auth.isVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    const isValid = await comparePassword(dto.password, auth.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtTokenService.generateAccessToken({
      sub: auth.id,
      email: auth.email,
      roles: auth.role,
      tokenVersion: auth.tokenVersion ?? 0,
    });

    const refreshToken = this.jwtTokenService.generateRefreshToken({
      sub: auth.id,
      email: auth.email,
      roles: auth.role,
      tokenVersion: auth.tokenVersion ?? 0,
    });

    const authToken = new AuthToken({
      authId: auth.id,
      token: refreshToken.token,
      type: AUTH_TOKEN_TYPES.refresh,
      expiredAt: refreshToken.expiredAt,
    });

    await this.authTokenRepo.save(authToken);

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      accessTokenExpiredAt: accessToken.expiredAt,
      refreshTokenExpiredAt: refreshToken.expiredAt,
    };
  }
}
