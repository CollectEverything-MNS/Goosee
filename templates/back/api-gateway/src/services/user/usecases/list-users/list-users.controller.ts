import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { routesConfig } from '../../../../config/routes.config';

import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';

@ApiTags('User')
@Controller()
export class ListUsersController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService,
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.user.getUsers.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('users')
  @ApiOperation({ summary: 'Recuperer la liste des utilisateurs' })
  async getUsers() {
    const url = routesConfig.user.getUsers.link(this.services.user);
    return this.httpProxy.get(url, 'Get user failed');
  }
}
