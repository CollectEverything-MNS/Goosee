import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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
export class GetRoleController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService,
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.role.getRole.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('roles')
  @ApiOperation({ summary: 'Recuperer un role' })
  async get(@Param('id') id: string) {
    const url = routesConfig.role.getRole.link(this.services.user, id);
    return this.httpProxy.get(url, 'Get role failed');
  }
}
