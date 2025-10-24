import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { serviceUrl } from '../../../../config/services.config';
import { routesConfig } from '../../../../config/routes.config';

@Injectable()
export class GetUserService {
  private readonly services;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.services = serviceUrl(this.config);
  }

  async execute(id: string) {
    const url = routesConfig.user.byId.link(this.services.user, id);
    const { data } = await firstValueFrom(this.http.get(url));
    return data;
  }
}
