import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { IUserRepository } from '../../repositories/user.repository';
import { GetUserDto } from './get-user.dto';

@Injectable()
export class GetUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: GetUserDto): Promise<User> {
    const newUser = new User({
      name: dto.name,
      email: dto.email,
    });

    return this.userRepo.save(newUser);
  }
}
