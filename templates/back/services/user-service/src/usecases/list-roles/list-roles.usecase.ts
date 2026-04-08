import { Injectable } from '@nestjs/common';
import { IRoleRepository } from '../../repositories/role.repository';

@Injectable()
export class ListRolesUseCase {
  constructor(private readonly roleRepo: IRoleRepository) {}

  async execute() {
    const roles = await this.roleRepo.list();
    return { message: 'Roles fetched successfully', roles };
  }
}
