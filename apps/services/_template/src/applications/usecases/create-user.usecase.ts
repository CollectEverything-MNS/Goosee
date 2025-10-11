import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { IUserRepository } from './../../domain/repositories/user.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const user = new User(randomUUID(), dto.name, dto.email);
    return this.userRepo.save(user);
  }
}
