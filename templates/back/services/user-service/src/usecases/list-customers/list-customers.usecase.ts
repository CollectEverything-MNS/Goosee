import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../repositories/user.repository';
import { User } from '../../entities/user.entity';

@Injectable()
export class ListCustomersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.listCustomers();
  }
}
