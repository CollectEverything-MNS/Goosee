import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { IUserRepository } from '../../repositories/user.repository';
import { CATEGORIE_PREUVE_RGPD, LogClient } from '../../shared/log-client.service';

export interface RgpdEraseResult {
  service: string;
  statut: 'efface' | 'absent' | 'echec';
  authPropage: boolean;
  raison?: string;
}

@Injectable()
export class RgpdEraseUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    @Inject('RMQ_CLIENT') private readonly rmq: ClientProxy,
    private readonly logClient: LogClient,
  ) {}

  // Idempotent : un profil deja efface renvoie "absent" sans lever.
  // `auth` n'est joignable que par cet evenement : seul ce service connait
  // la correspondance customerId -> authId.
  //
  // L'ordre est impose par cette exclusivite : on propage AVANT d'effacer le
  // profil. Effacer d'abord rendrait un echec du courtier definitif — la ligne
  // `auth` (courriel, condensat) survivrait sans que plus aucun code ne sache
  // la designer, et un rejeu ne trouverait qu'un profil "absent". En propageant
  // d'abord, un echec laisse les deux lignes intactes : le bilan porte "echec"
  // et un rejeu repart du meme etat.
  async execute(customerId: string): Promise<RgpdEraseResult> {
    const user = await this.userRepo.findById(customerId);
    if (!user) {
      this.logClient.warning({
        message: `Demande d'effacement RGPD pour un profil deja absent : ${customerId}`,
        userId: customerId,
        categorie: CATEGORIE_PREUVE_RGPD,
      });
      return { service: 'user', statut: 'absent', authPropage: false };
    }

    if (!user.authId) {
      await this.userRepo.deleteById(customerId);
      this.logClient.success({
        message: `Profil efface par demande RGPD (sans compte auth associe) : ${customerId}`,
        userId: customerId,
        categorie: CATEGORIE_PREUVE_RGPD,
      });
      return { service: 'user', statut: 'efface', authPropage: false };
    }

    try {
      await lastValueFrom(this.rmq.emit('user.deleted', { authId: user.authId }));
    } catch (err) {
      const raison = (err as Error).message;
      this.logClient.error({
        message:
          `Effacement RGPD interrompu : propagation a auth impossible, ` +
          `profil conserve pour permettre un rejeu : ${customerId} (${raison})`,
        userId: customerId,
        categorie: CATEGORIE_PREUVE_RGPD,
      });
      return { service: 'user', statut: 'echec', authPropage: false, raison };
    }

    await this.userRepo.deleteById(customerId);
    this.logClient.success({
      message: `Profil efface par demande RGPD et effacement propage a auth : ${customerId}`,
      userId: customerId,
      categorie: CATEGORIE_PREUVE_RGPD,
    });
    return { service: 'user', statut: 'efface', authPropage: true };
  }
}
