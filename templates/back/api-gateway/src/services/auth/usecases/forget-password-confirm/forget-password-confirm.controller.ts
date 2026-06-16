import { Body, Controller, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { ForgetPasswordConfirmDto } from './forget-password-confirm.dto';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from '../../../../config/services.config';

@ApiTags('Auth')
@Controller()
export class ForgetPasswordConfirmController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }
  @Put(routesConfig.auth.forgetPasswordConfirm.path)
  @ApiOperation({ summary: 'Mot de passe oublié confirmation' })
  async forgetPasswordConfirm(@Body() dto: ForgetPasswordConfirmDto) {
    const url = routesConfig.auth.forgetPasswordConfirm.link(this.services.auth);
    return this.httpProxy.put(url, dto, 'Forget password confirm failed');
  }
}
