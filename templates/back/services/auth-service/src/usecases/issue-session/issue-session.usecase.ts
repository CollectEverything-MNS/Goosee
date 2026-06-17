import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthToken, AUTH_TOKEN_TYPES } from '../../entities/auth-token.entity';
import { IAuthRepository } from '../../repositories/auth.repository';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';
import { LoginResponseDto } from '../login/login.dto';
import { JwtTokenService } from '../../shared/services/jwt-token.service';

/**
 * Émet une session (access + refresh) pour un e-mail déjà authentifié par un canal de
 * confiance (SSO depuis la vitrine : jeton signé HMAC vérifié par la gateway). Aucun mot de
 * passe : c'est l'équivalent d'un login réussi, réservé à l'usage interne.
 */
@Injectable()
export class IssueSessionUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly authTokenRepo: IAuthTokenRepository,
    private readonly jwtTokenService: JwtTokenService
  ) {}

  async execute(email: string): Promise<LoginResponseDto> {
    const auth = await this.authRepo.findByEmail(email);
    if (!auth) {
      throw new UnauthorizedException('User not found');
    }

    const claims = {
      sub: auth.id,
      email: auth.email,
      roles: auth.role,
      tokenVersion: auth.tokenVersion ?? 0,
    };
    const accessToken = this.jwtTokenService.generateAccessToken(claims);
    const refreshToken = this.jwtTokenService.generateRefreshToken(claims);

    await this.authTokenRepo.save(
      new AuthToken({
        authId: auth.id,
        token: refreshToken.token,
        type: AUTH_TOKEN_TYPES.refresh,
        expiredAt: refreshToken.expiredAt,
      })
    );

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      accessTokenExpiredAt: accessToken.expiredAt,
      refreshTokenExpiredAt: refreshToken.expiredAt,
    };
  }
}
