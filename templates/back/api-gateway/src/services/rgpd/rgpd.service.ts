import { Injectable } from '@nestjs/common';
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
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async erase(customerId: string): Promise<BilanEffacement> {
    const urls = serviceUrl(this.config);
    const headers = { 'x-internal-token': this.config.get<string>('INTERNAL_API_TOKEN') };
    // `auth` ne figure pas ici : sa ligne est adressee par authId, que seul
    // user-service connait. Il est efface par l'evenement user.deleted (Task 3).
    const cibles = [
      ['user', urls.user],
      ['cart', urls.cart],
      ['order', urls.order],
      ['ticket', urls.ticket],
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

    return { customerId, resultats };
  }

  async export(customerId: string): Promise<Record<string, unknown>> {
    const urls = serviceUrl(this.config);
    const headers = { 'x-internal-token': this.config.get<string>('INTERNAL_API_TOKEN') };
    const cibles = [urls.user, urls.order, urls.ticket];

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
