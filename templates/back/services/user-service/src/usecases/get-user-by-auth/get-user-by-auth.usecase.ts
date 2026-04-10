import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../repositories/user.repository';

@Injectable()
export class GetUserByAuthUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(authId: string) {
    const user = await this.userRepo.findByAuthId(authId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
