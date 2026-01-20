import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { serviceUrl, ServiceUrls } from '../../../../config/services.config';
import { routesConfig } from '../../../../config/routes.config';
import { ChangePasswordDto } from './change-password.dto';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';

@Injectable()
export class ChangePasswordService {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  async execute(dto: ChangePasswordDto) {
    const url = routesConfig.auth.changePassword.link(this.services.auth);
    return this.httpProxy.post(url, dto, 'Change password failed');
  }
}
