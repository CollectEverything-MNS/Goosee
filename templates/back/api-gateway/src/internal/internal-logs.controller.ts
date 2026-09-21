import { Controller, Get, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { serviceUrl } from '../config/services.config';
import { InternalTokenGuard } from '../shared/internal-token.guard';

// Journaux du site, exposés au control plane (superadmin) via le jeton interne.
@Controller('internal/logs')
@UseGuards(InternalTokenGuard)
export class InternalLogsController {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async logs() {
    const urls = serviceUrl(this.config);
    const res = await firstValueFrom(this.http.get(`${urls.log}/logs`));
    return res.data;
  }
}
