import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AUTH_TOKEN_TYPES } from '../../entities/auth-token.entity';
import { IAuthRepository } from '../../repositories/auth.repository';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly tokenRepo: IAuthTokenRepository
  ) {}

  async execute(tokenValue: string): Promise<{ message: string }> {
    const token = await this.tokenRepo.findByToken(tokenValue);

    if (!token || token.type !== AUTH_TOKEN_TYPES.emailVerification) {
      throw new BadRequestException('Invalid token');
    }

    if (token.expiredAt < new Date()) {
      throw new BadRequestException('Token expired');
    }

    const auth = await this.authRepo.findById(token.authId);
    if (!auth) {
      throw new NotFoundException('User not found');
    }

    if (!auth.isVerified) {
      auth.isVerified = true;
      auth.verifiedAt = new Date();
      await this.authRepo.save(auth);
    }

    await this.tokenRepo.deleteByToken(tokenValue);

    return { message: 'Email verified successfully' };
  }
}
