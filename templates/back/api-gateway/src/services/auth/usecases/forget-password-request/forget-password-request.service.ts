import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { serviceUrl, ServiceUrls } from '../../../../config/services.config';
import { routesConfig } from '../../../../config/routes.config';
import { ForgetPasswordRequestDto } from './forget-password-request.dto';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';

@Injectable()
export class ForgetPasswordRequestService {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  async execute(dto: ForgetPasswordRequestDto) {
    const url = routesConfig.auth.forgetPasswordRequest.link(this.services.auth);
    return this.httpProxy.post(url, dto, 'Forget password request failed');
  }
}
