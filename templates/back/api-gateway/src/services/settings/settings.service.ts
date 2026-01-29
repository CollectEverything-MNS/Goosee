import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from '../../shared/services/http-proxy.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  private readonly pageServiceUrl: string;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly configService: ConfigService
  ) {
    const host = this.configService.get<string>('PAGE_SERVICE_HOST');
    const port = this.configService.get<string>('PAGE_SERVICE_PORT');
    this.pageServiceUrl = `http://${host}:${port}`;
  }

  async get() {
    return this.httpProxy.get(`${this.pageServiceUrl}/settings`, 'Failed to fetch settings');
  }

  async update(dto: UpdateSettingsDto) {
    return this.httpProxy.put(`${this.pageServiceUrl}/settings`, dto, 'Failed to update settings');
  }
}
