import { BadRequestException, Injectable } from '@nestjs/common';
import { IRoleRepository } from '../../repositories/role.repository';
import { Role } from '../../entities/role.entity';
import { CreateRoleDto } from './create-role.dto';
import { LogClient } from '../../shared/log-client.service';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    private readonly roleRepo: IRoleRepository,
    private readonly logClient: LogClient,
  ) {}

  async execute(dto: CreateRoleDto): Promise<Role> {
    const trimmedName = dto.name.trim();

    const existing = await this.roleRepo.findByName(trimmedName);
    if (existing) {
      this.logClient.warning({
        message: `Tentative de création d'un rôle déjà existant : ${trimmedName}`,
      });
      throw new BadRequestException('ROLE_NAME_ALREADY_EXISTS');
    }

    const role = new Role();
    role.name = trimmedName;
    role.description = dto.description;
    role.isSystem = false;
    role.pageKeys = dto.pageKeys;

    const saved = await this.roleRepo.save(role);

    this.logClient.success({
      message: `Rôle créé : ${saved.name}`,
    });

    return saved;
  }
}
