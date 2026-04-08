import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IRoleRepository } from '../../repositories/role.repository';
import { UpdateRoleDto } from './update-role.dto';
import { LogClient } from '../../shared/log-client.service';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    private readonly roleRepo: IRoleRepository,
    private readonly logClient: LogClient,
  ) {}

  async execute(id: string, dto: UpdateRoleDto) {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      this.logClient.warning({
        message: `Tentative de modification du rôle système : ${role.name}`,
      });
      throw new ForbiddenException('SYSTEM_ROLE_NOT_EDITABLE');
    }

    if (dto.name !== undefined) {
      const trimmed = dto.name.trim();
      if (trimmed !== role.name) {
        const existing = await this.roleRepo.findByName(trimmed);
        if (existing) {
          throw new BadRequestException('ROLE_NAME_ALREADY_EXISTS');
        }
        role.name = trimmed;
      }
    }

    if (dto.description !== undefined) {
      role.description = dto.description;
    }

    if (dto.pageKeys !== undefined) {
      role.pageKeys = dto.pageKeys;
    }

    const updated = await this.roleRepo.save(role);

    this.logClient.success({
      message: `Rôle mis à jour : ${updated.name}`,
    });

    return { message: 'Role updated successfully', role: updated };
  }
}
