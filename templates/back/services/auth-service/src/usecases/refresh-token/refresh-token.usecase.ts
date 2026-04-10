import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, } from '@nestjs/common';
import { AuthToken, AUTH_TOKEN_TYPES } from '../../entities/auth-token.entity';
import { IAuthRepository } from '../../repositories/auth.repository';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';
import { JwtTokenService } from '../../shared/services/jwt-token.service';
import { RefreshTokenDto, RefreshTokenResponseDto } from './refresh-token.dto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly authTokenRepo: IAuthTokenRepository,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    const payload = this.jwtTokenService.verifyRefreshToken(dto.token);
    const authToken = await this.authTokenRepo.findByToken(dto.token);

    if (!authToken) {
      throw new NotFoundException('Token not found');
    }

    if (authToken.type !== AUTH_TOKEN_TYPES.refresh) {
      throw new UnauthorizedException('Invalid token type');
    }

    if (new Date() > authToken.expiredAt) {
      throw new UnauthorizedException('Token expired');
    }

    if (payload.sub !== authToken.authId) {
      throw new UnauthorizedException('Invalid token owner');
    }

    const auth = await this.authRepo.findById(authToken.authId);
    if (!auth) {
      throw new UnauthorizedException('User not found');
    }

    if (payload.tokenVersion !== (auth.tokenVersion ?? 0)) {
      throw new UnauthorizedException('Token revoked');
    }

    await this.authTokenRepo.deleteByToken(dto.token);

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

    const savedToken = await this.authTokenRepo.save(
      new AuthToken({
        authId: auth.id,
        token: refreshToken.token,
        type: AUTH_TOKEN_TYPES.refresh,
        expiredAt: refreshToken.expiredAt,
      }),
    );

    if (!savedToken) {
      throw new BadRequestException('Invalid token');
    }

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      accessTokenExpiredAt: accessToken.expiredAt,
      refreshTokenExpiredAt: refreshToken.expiredAt,
    };
  }
}
