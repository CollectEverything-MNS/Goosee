import { Controller, Get, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { serviceUrl } from '../config/services.config';
import { InternalTokenGuard } from '../shared/internal-token.guard';

@Controller('internal/kpi')
@UseGuards(InternalTokenGuard)
export class InternalKpiController {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async kpi() {
    const urls = serviceUrl(this.config);
    const headers = { 'x-internal-token': this.config.get<string>('INTERNAL_API_TOKEN') };

    const [user, product, order] = await Promise.all([
      firstValueFrom(this.http.get(`${urls.user}/internal/kpi`, { headers })),
      firstValueFrom(this.http.get(`${urls.product}/internal/kpi`, { headers })),
      firstValueFrom(this.http.get(`${urls.order}/internal/kpi`, { headers })),
    ]);

    return { ...user.data, ...product.data, ...order.data };
  }
}
