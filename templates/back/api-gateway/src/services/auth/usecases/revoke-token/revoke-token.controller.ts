import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { RevokeTokenDto } from './revoke-token.dto';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from '../../../../config/services.config';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';

@ApiTags('Auth')
@Controller()
export class RevokeTokenController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Post(routesConfig.auth.token.revoke.path)
  @ApiOperation({ summary: 'Suppression du token' })
  async revoke(@Body() dto: RevokeTokenDto) {
    const url = routesConfig.auth.token.revoke.link(this.services.auth);
    return this.httpProxy.post(url, dto, 'Revoke token failed');
  }
}
