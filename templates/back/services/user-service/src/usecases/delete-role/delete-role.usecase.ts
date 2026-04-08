import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IRoleRepository } from '../../repositories/role.repository';
import { LogClient } from '../../shared/log-client.service';

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    private readonly roleRepo: IRoleRepository,
    private readonly logClient: LogClient,
  ) {}

  async execute(id: string) {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      this.logClient.warning({
        message: `Tentative de suppression du rôle système : ${role.name}`,
      });
      throw new ForbiddenException('SYSTEM_ROLE_NOT_DELETABLE');
    }

    await this.roleRepo.deleteById(id);

    this.logClient.success({
      message: `Rôle supprimé : ${role.name}`,
    });

    return { message: 'Role deleted successfully' };
  }
}
