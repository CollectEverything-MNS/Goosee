import { BadRequestException, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../repositories/user.repository';
import { CreateUserDto } from './create-user.dto';
import { RoleType, User } from '../../entities/user.entity';
import { LogClient } from '../../shared/log-client.service';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
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
    user.role = dto.role?.length ? dto.role : [RoleType.CUSTOMER];

    const saved = await this.userRepo.save(user);

    this.logClient.success({
      message: `Utilisateur créé : ${saved.email}`,
      userId: saved.id,
    });

    return {
      message: 'User created successfully',
    };
  }
}
