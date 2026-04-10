import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { IUserRepository } from '../../repositories/user.repository';
import { DEFAULT_CUSTOMER_ROLE, User } from '../../entities/user.entity';

@Controller()
export class CreateUserEventsListener {
  private readonly logger = new Logger(CreateUserEventsListener.name);

  constructor(private readonly userRepo: IUserRepository) {}

  @EventPattern('auth.registered')
  async handleUserRegistered(@Payload() data: { authId: string; email: string; firstName?: string; lastName?: string }) {
    this.logger.log(`Événement auth.registered reçu pour : ${data.email}`);

    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      if (!existing.authId) {
        existing.authId = data.authId;
        await this.userRepo.save(existing);
        this.logger.log(`authId mis à jour pour : ${data.email}`);
      } else {
        this.logger.warn(`Utilisateur déjà existant pour : ${data.email}`);
      }
      return;
    }

    const user = new User();
    user.authId = data.authId;
    user.email = data.email;
    user.firstName = data.firstName || '';
    user.lastName = data.lastName || '';
    user.role = [DEFAULT_CUSTOMER_ROLE];

    await this.userRepo.save(user);

    this.logger.log(`Utilisateur créé avec succès pour : ${data.email}`);
  }
}
