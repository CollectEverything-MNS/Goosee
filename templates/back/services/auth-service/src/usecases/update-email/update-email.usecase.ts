import { Injectable, ConflictException } from '@nestjs/common';
import { IAuthRepository } from '../../repositories/auth.repository';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';
import { AuthToken, AUTH_TOKEN_TYPES } from '../../entities/auth-token.entity';
import { JwtTokenService } from '../../shared/services/jwt-token.service';
import { UpdateEmailDto } from './update-email.dto';

@Injectable()
export class UpdateEmailUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly authTokenRepo: IAuthTokenRepository,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async execute(dto: UpdateEmailDto): Promise<void> {
    const auth = await this.authRepo.findById(dto.authId);
    if (!auth) {
      return;
    }

    if (dto.newEmail && dto.newEmail !== auth.email) {
      const existingAuth = await this.authRepo.findByEmail(dto.newEmail);
      if (existingAuth) {
        throw new ConflictException('Email already exists');
      }

      auth.email = dto.newEmail;
    }

    const roleChanged = this.hasRoleChanged(auth.role, dto.role);
    if (dto.role?.length) {
      auth.role = dto.role;
    }
    if (roleChanged) {
      auth.tokenVersion = (auth.tokenVersion ?? 0) + 1;
    }

    await this.authRepo.save(auth);

    if (roleChanged) {
      await this.authTokenRepo.deleteByAuthId(auth.id);

      const refreshToken = this.jwtTokenService.generateRefreshToken({
        sub: auth.id,
        email: auth.email,
        roles: auth.role,
        tokenVersion: auth.tokenVersion ?? 0,
      });

      await this.authTokenRepo.save(
        new AuthToken({
          authId: auth.id,
          token: refreshToken.token,
          type: AUTH_TOKEN_TYPES.refresh,
          expiredAt: refreshToken.expiredAt,
        }),
      );
    }
  }

  private hasRoleChanged(currentRoles: string[], nextRoles?: string[]): boolean {
    if (!nextRoles?.length) {
      return false;
    }

    const normalize = (roles: string[]) => [...roles].map((role) => role.trim()).filter(Boolean).sort();
    const current = normalize(currentRoles ?? []);
    const next = normalize(nextRoles);

    if (current.length !== next.length) {
      return true;
    }

    return current.some((role, index) => role !== next[index]);
  }
}
