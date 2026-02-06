import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { IUserRepository } from '../../repositories/user.repository';
import { RoleType, User } from '../../entities/user.entity';

@Controller()
export class CreateUserEventsListener {
  private readonly logger = new Logger(CreateUserEventsListener.name);

  constructor(private readonly userRepo: IUserRepository) {}

  @EventPattern('auth.registered')
  async handleUserRegistered(@Payload() data: { authId: string; email: string }) {
    this.logger.log(`Événement auth.registered reçu pour : ${data.email}`);

    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      this.logger.warn(`Utilisateur déjà existant pour : ${data.email}`);
      return;
    }

    const user = new User();
    user.email = data.email;
    user.firstName = '';
    user.lastName = '';
    user.role = [RoleType.CUSTOMER];

    await this.userRepo.save(user);

    this.logger.log(`Utilisateur créé avec succès pour : ${data.email}`);
  }
}
