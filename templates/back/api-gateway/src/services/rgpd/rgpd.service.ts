import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { serviceUrl } from '../../config/services.config';

export interface ResultatService {
  service: string;
  statut: string;
  raison?: string;
}

export interface BilanEffacement {
  customerId: string;
  resultats: ResultatService[];
}

// Orchestration partagee par la route interne (`/internal/rgpd/*`, appelee de
// service a service) et par la route d'administration (`/admin/rgpd/*`, appelee
// par le marchand depuis le back-office). Une seule copie : la liste des
// services cibles ne doit pas diverger entre les deux portes d'entree.
@Injectable()
export class RgpdService {
  private readonly logger = new Logger(RgpdService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  // `acteur` est l'identifiant technique du demandeur : le `sub` du jeton pour
  // le marchand, une constante pour un appel de service a service.
  async erase(customerId: string, acteur = 'inconnu'): Promise<BilanEffacement> {
    const urls = serviceUrl(this.config);
    const headers = { 'x-internal-token': this.config.get<string>('INTERNAL_API_TOKEN') };
    // `auth` ne figure pas ici : sa ligne est adressee par authId, que seul
    // user-service connait. Il est efface par l'evenement user.deleted (Task 3).
    // `ticket` non plus : ticket-service n'est deploye que dans la pile de
    // developpement, jamais dans la pile d'un tenant (docker-compose.tenant.yml
    // ne le declare pas). L'appeler produirait un echec permanent au bilan, qui
    // ferait douter d'un effacement pourtant complet. Son code d'effacement et
    // d'export reste en place et reviendra dans cette liste le jour ou le
    // service sera deploye.
    const cibles = [
      ['user', urls.user],
      ['cart', urls.cart],
      ['order', urls.order],
      ['log', urls.log],
    ] as const;

    // allSettled et non all : un service indisponible ne doit pas annuler
    // l'effacement reussi dans les autres.
    const reponses = await Promise.allSettled(
      cibles.map(([, url]) =>
        firstValueFrom(this.http.post(`${url}/internal/rgpd/erase`, { customerId }, { headers })),
      ),
    );

    const resultats: ResultatService[] = reponses.map((r, i) =>
      r.status === 'fulfilled'
        ? (r.value.data as ResultatService)
        : { service: cibles[i][0], statut: 'echec', raison: (r.reason as Error).message },
    );

    // Article 5.2 : la responsabilite se demontre. Le bilan rendu au navigateur
    // ne survit pas a l'onglet du marchand ; il faut qu'il en reste une trace
    // cote serveur. Par identifiants uniquement : le courriel de la personne
    // effacee n'a rien a faire dans un journal qu'on conserve.
    this.logger.log(
      `Effacement RGPD acteur=${acteur} customerId=${customerId} bilan=` +
        resultats.map((r) => `${r.service}:${r.statut}`).join(','),
    );

    return { customerId, resultats };
  }

  async export(customerId: string): Promise<Record<string, unknown>> {
    const urls = serviceUrl(this.config);
    const headers = { 'x-internal-token': this.config.get<string>('INTERNAL_API_TOKEN') };
    // Meme exclusion de `ticket` que pour l'effacement, et pour la meme raison :
    // le service n'existe pas dans une pile de tenant.
    const cibles = [urls.user, urls.order];

    const reponses = await Promise.all(
      cibles.map((url) =>
        firstValueFrom(
          this.http.get(`${url}/internal/rgpd/export`, { headers, params: { customerId } }),
        ),
      ),
    );

    return Object.assign(
      { exporteLe: new Date().toISOString() },
      ...reponses.map((r) => r.data as Record<string, unknown>),
    ) as Record<string, unknown>;
  }
}
