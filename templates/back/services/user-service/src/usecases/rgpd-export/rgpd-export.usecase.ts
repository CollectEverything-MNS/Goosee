import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../repositories/user.repository';

@Injectable()
export class RgpdExportUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(customerId: string) {
    const user = await this.userRepo.findById(customerId);
    if (!user) {
      throw new NotFoundException('Acheteur introuvable');
    }
    return {
      compte: {
        id: user.id,
        email: user.email,
        prenom: user.firstName ?? null,
        nom: user.lastName ?? null,
        telephone: user.phone ?? null,
        adresse: user.address ?? null,
        codePostal: user.postaleCode ?? null,
        ville: user.city ?? null,
        pays: user.country ?? null,
      },
    };
  }
}
