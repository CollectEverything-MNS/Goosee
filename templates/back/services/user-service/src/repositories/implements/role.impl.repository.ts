import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { IRoleRepository } from '../role.repository';

@Injectable()
export class TypeOrmRoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>
  ) {}

  async save(role: Role): Promise<Role> {
    return this.repository.save(role);
  }

  async findById(id: string): Promise<Role | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.repository.findOne({ where: { name } });
  }

  async list(): Promise<Role[]> {
    return this.repository.find({ order: { isSystem: 'DESC', name: 'ASC' } });
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
}
