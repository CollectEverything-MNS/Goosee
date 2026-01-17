import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { IUserRepository } from '../../repositories/user.repository';
import { GetUserDto } from './get-user.dto';

@Injectable()
export class GetUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(id: string) {
    return {
      id: id,
      name: "Romain",
      email: "Test",
      // pensons à l utiliser ex: return this.userRepo.findById(id)
    };

  }
}
