import { Injectable } from '@nestjs/common';
import { IAuthRepository } from '../../repositories/auth.repository';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';
import { SoftDeleteDto } from './soft-delete.dto';

@Injectable()
export class SoftDeleteUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly tokenRepo: IAuthTokenRepository,
  ) {}

  async execute(dto: SoftDeleteDto): Promise<void> {
    await this.tokenRepo.deleteByAuthId(dto.authId);
    await this.authRepo.eraseById(dto.authId);
  }
}
