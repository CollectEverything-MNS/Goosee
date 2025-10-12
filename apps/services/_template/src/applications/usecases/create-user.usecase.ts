import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { CreateUserDto } from '../dtos/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const user = new User();
    return this.userRepo.save(user);
  }
}
