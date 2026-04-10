import { Injectable, NotFoundException } from '@nestjs/common';
import { AUTH_TOKEN_TYPES } from '../../entities/auth-token.entity';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';
import { JwtTokenService } from '../../shared/services/jwt-token.service';
import { RevokeTokenDto } from './revoke-token.dto';

@Injectable()
export class RevokeTokenUseCase {
  constructor(
    private readonly authTokenRepo: IAuthTokenRepository,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async execute(dto: RevokeTokenDto): Promise<{ message: string }> {
    this.jwtTokenService.verifyRefreshToken(dto.token);
    const token = await this.authTokenRepo.findByToken(dto.token);

    if (!token) {
      throw new NotFoundException('Token not found');
    }

    if (token.type !== AUTH_TOKEN_TYPES.refresh) {
      throw new NotFoundException('Token not found');
    }

    await this.authTokenRepo.deleteByToken(dto.token);

    return { message: 'Token revoked successfully' };
  }
}
