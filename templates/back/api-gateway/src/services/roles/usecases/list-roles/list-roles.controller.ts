import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';

@ApiTags('Role')
@Controller()
export class ListRolesController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService,
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.role.listRoles.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('roles')
  @ApiOperation({ summary: 'Liste des roles' })
  async list() {
    const url = routesConfig.role.listRoles.link(this.services.user);
    return this.httpProxy.get(url, 'List roles failed');
  }
}
