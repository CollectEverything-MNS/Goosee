import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { IUserRepository } from '../../repositories/user.repository';
import { CreateUserDto } from './create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const newUser = new User({
      name: dto.name,
      email: dto.email,
    });

    return this.userRepo.save(newUser);
  }
}
