import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../repositories/user.repository';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { LogClient } from '../../shared/log-client.service';


@Injectable()
export class DeleteUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    @Inject('RMQ_CLIENT') private rmq: ClientProxy,
    private readonly logClient: LogClient,
  ) {}

  async execute(id: string) {
    const user = await this.userRepo.findById(id);

    if (!user) {
      this.logClient.warning({
        message: `Tentative de suppression d'un utilisateur introuvable : ${id}`,
      });
      throw new NotFoundException('User not found');
    }

    await this.userRepo.deleteById(id);

    if (user.authId) {
      await lastValueFrom(
        this.rmq.emit('user.deleted', {
          authId: user.authId,
        }),
      );
    }

    this.logClient.success({
      message: `Utilisateur supprime : ${id}`,
      userId: id,
    });

    return {
      message: 'User deleted successfully',
    };
  }
}
