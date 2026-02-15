import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('User')
@Controller()
export class ListAdminsController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.user.listAdmins.path)
  @ApiOperation({ summary: 'Liste des utilisateurs (ADMIN et OWNER)' })
  async getAdmins() {
    const url = routesConfig.user.listAdmins.link(this.services.user);
    return this.httpProxy.get(url, 'Get admins failed');
  }
}
