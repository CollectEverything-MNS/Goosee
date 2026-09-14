import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { serviceUrl } from '../config/services.config';
import { InternalTokenGuard } from '../shared/internal-token.guard';

interface ResultatService {
  service: string;
  statut: string;
  raison?: string;
}

@Controller('internal/rgpd')
@UseGuards(InternalTokenGuard)
export class RgpdController {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  @Post('erase/:customerId')
  async erase(@Param('customerId') customerId: string) {
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
}
