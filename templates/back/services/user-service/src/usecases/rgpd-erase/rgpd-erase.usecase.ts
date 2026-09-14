import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { IUserRepository } from '../../repositories/user.repository';

export interface RgpdEraseResult {
  service: string;
  statut: 'efface' | 'absent';
  authPropage: boolean;
}

@Injectable()
export class RgpdEraseUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    @Inject('RMQ_CLIENT') private readonly rmq: ClientProxy,
  ) {}

  // Idempotent : un profil deja efface renvoie "absent" sans lever.
  // `auth` n'est joignable que par cet evenement : seul ce service connait
  // la correspondance customerId -> authId.
  async execute(customerId: string): Promise<RgpdEraseResult> {
    const user = await this.userRepo.findById(customerId);
    if (!user) {
      return { service: 'user', statut: 'absent', authPropage: false };
    }

    await this.userRepo.deleteById(customerId);

    if (!user.authId) {
      return { service: 'user', statut: 'efface', authPropage: false };
    }

    await lastValueFrom(this.rmq.emit('user.deleted', { authId: user.authId }));
    return { service: 'user', statut: 'efface', authPropage: true };
  }
}
