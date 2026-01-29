import { Body, Controller, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ForgetPasswordRequestDto } from './forget-password-request.dto';
import { routesConfig } from '../../../../config/routes.config';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';

@ApiTags('Auth')
@Controller()
export class ForgetPasswordRequestController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Put(routesConfig.auth.forgetPasswordRequest.path)
  @ApiOperation({ summary: 'Mot de passe oublié demande' })
  async forgetPasswordRequest(@Body() dto: ForgetPasswordRequestDto) {
    const url = routesConfig.auth.forgetPasswordRequest.link(this.services.auth);
    return this.httpProxy.post(url, dto, 'Forget password request failed');
  }
}
