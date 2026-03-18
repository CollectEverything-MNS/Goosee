import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../user.repository';
import { User, RoleType } from '../../entities/user.entity';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async list(): Promise<User[]> {
    return this.repository.find();
  }

  async listCustomers(): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .where(':role = ANY(user.role)', { role: RoleType.CUSTOMER })
      .getMany();
  }

  async listAdmins(): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .where(':adminRole = ANY(user.role) OR :ownerRole = ANY(user.role)', {
        adminRole: RoleType.ADMIN,
        ownerRole: RoleType.OWNER,
      })
      .getMany();
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}

