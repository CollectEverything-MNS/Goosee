import { Body, Controller, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from '../../../../config/services.config';
import { ChangePasswordDto } from './change-password.dto';
import { routesConfig } from '../../../../config/routes.config';

@ApiTags('Auth')
@Controller()
export class ChangePasswordController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Put(routesConfig.auth.changePassword.path)
  @ApiOperation({ summary: "Changement de mot de passe d'un utilisateur" })
  async changePassword(@Body() dto: ChangePasswordDto) {
    const url = routesConfig.auth.changePassword.link(this.services.auth);
    return this.httpProxy.post(url, dto, 'Change password failed');
  }
}
