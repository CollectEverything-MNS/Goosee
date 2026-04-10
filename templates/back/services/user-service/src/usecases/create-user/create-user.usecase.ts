import { BadRequestException, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../repositories/user.repository';
import { CreateUserDto } from './create-user.dto';
import { DEFAULT_CUSTOMER_ROLE, User } from '../../entities/user.entity';
import { LogClient } from '../../shared/log-client.service';
import { IRoleRepository } from '../../repositories/role.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly roleRepo: IRoleRepository,
    private readonly logClient: LogClient
  ) {}

  async execute(dto: CreateUserDto) {
    const existingUser = await this.userRepo.findByEmail(dto.email);

    if (existingUser) {
      this.logClient.warning({
        message: `Tentative de création d'un utilisateur avec un email déjà existant : ${dto.email}`,
      });
      throw new BadRequestException('Email already exists');
    }

    const user = new User();
    user.email = dto.email;
    user.firstName = dto.firstName;
    user.lastName = dto.lastName;
    user.phone = dto.phone ?? '';
    user.address = dto.address ?? '';
    user.postaleCode = dto.postaleCode ?? '';
    user.city = dto.city ?? '';
    user.country = dto.country ?? '';
    const roles = dto.role?.length ? dto.role : [DEFAULT_CUSTOMER_ROLE];
    user.role = await this.resolveAndValidateRoles(roles);

    const saved = await this.userRepo.save(user);

    this.logClient.success({
      message: `Utilisateur créé : ${saved.email}`,
      userId: saved.id,
    });

    return {
      message: 'User created successfully',
    };
  }

  private async resolveAndValidateRoles(roles: string[]): Promise<string[]> {
    const normalizedRoles = Array.from(
      new Set(roles.map((role) => role.trim()).filter(Boolean)),
    );

    if (!normalizedRoles.length) {
      throw new BadRequestException('At least one role is required');
    }

    for (const roleName of normalizedRoles) {
      const role = await this.roleRepo.findByName(roleName);
      if (!role) {
        throw new BadRequestException(`Role does not exist: ${roleName}`);
      }
    }

    return normalizedRoles;
  }
}
