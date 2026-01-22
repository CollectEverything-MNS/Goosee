import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './refresh-token.dto';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from '../../../../config/services.config';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';

@ApiTags('Auth')
@Controller()
export class RefreshTokenController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }
  
  @Post(routesConfig.auth.token.refresh.path)
  @ApiOperation({ summary: 'Rafraîchissement du token (MAJ expiredAt)' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const url = routesConfig.auth.token.refresh.link(this.services.auth);
    return this.httpProxy.post(url, dto, 'Refresh token failed');
  }
}
