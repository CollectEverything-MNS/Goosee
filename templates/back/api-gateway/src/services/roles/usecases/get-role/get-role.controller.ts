import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';

@ApiTags('Role')
@Controller()
export class GetRoleController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService,
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.role.getRole.path)
  @ApiOperation({ summary: 'Récupérer un rôle' })
  async get(@Param('id') id: string) {
    const url = routesConfig.role.getRole.link(this.services.user, id);
    return this.httpProxy.get(url, 'Get role failed');
  }
}
