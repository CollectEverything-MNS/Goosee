import { Injectable, NotFoundException } from '@nestjs/common';
import { IRoleRepository } from '../../repositories/role.repository';

@Injectable()
export class GetRoleUseCase {
  constructor(private readonly roleRepo: IRoleRepository) {}

  async execute(id: string) {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return { message: 'Role fetched successfully', role };
  }
}
