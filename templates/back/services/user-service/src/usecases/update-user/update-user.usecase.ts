import { Inject, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../repositories/user.repository';
import { UpdateUserDto } from './update-user.dto';
import { User } from '../../entities/user.entity';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { LogClient } from '../../shared/log-client.service';
import { IRoleRepository } from '../../repositories/role.repository';


@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly roleRepo: IRoleRepository,
    @Inject('RMQ_CLIENT') private rmq: ClientProxy,
    private readonly logClient: LogClient,
  ) {}

  async execute(id: string, dto: UpdateUserDto) {
    const user = await this.userRepo.findById(id);

    if (!user) {
      this.logClient.warning({
        message: `Tentative de mise à jour d'un utilisateur introuvable : ${id}`,
      });
      throw new NotFoundException('User not found');
    }

    const emailChanged = Boolean(dto.email && dto.email !== user.email);
    const nextRole = dto.role ? await this.resolveAndValidateRoles(dto.role) : user.role;
    const roleChanged = Boolean(dto.role);

    const userUpdated: User = {
      ...user,
      id: user.id,
      authId: user.authId,
      firstName: dto.firstName ?? user.firstName,
      lastName: dto.lastName ?? user.lastName,
      phone: dto.phone ?? user.phone,
      address: dto.address ?? user.address,
      postaleCode: dto.postaleCode ?? user.postaleCode,
      city: dto.city ?? user.city,
      country: dto.country ?? user.country,
      role: nextRole,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    };

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findByEmail(dto.email);
      if (existing) {
        throw new BadRequestException('Email already exists');
      }
      userUpdated.email = dto.email;
    }

    await this.userRepo.save(userUpdated);

    if (userUpdated.authId && (emailChanged || roleChanged)) {
      await lastValueFrom(
        this.rmq.emit('user.updated', {
          authId: userUpdated.authId,
          newEmail: emailChanged ? userUpdated.email : undefined,
          role: userUpdated.role,
        }),
      );
    }

    this.logClient.success({
      message: `Utilisateur mis à jour : ${userUpdated.email}`,
      userId: userUpdated.id,
    });

    return {
      message: 'User updated successfully',
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
