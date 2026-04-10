import { Injectable, NotFoundException } from '@nestjs/common';
import { IAuthRepository } from '../../repositories/auth.repository';

@Injectable()
export class GetTokenVersionUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(authId: string): Promise<{ tokenVersion: number }> {
    const auth = await this.authRepo.findById(authId);
    if (!auth) {
      throw new NotFoundException('User not found');
    }

    return {
      tokenVersion: auth.tokenVersion ?? 0,
    };
  }
}
