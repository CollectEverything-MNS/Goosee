import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { routesConfig } from '../../../../config/routes.config';

import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';

@ApiTags('User')
@Controller()
export class GetUserController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService,
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.user.getUser.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('users')
  @ApiOperation({ summary: 'Recuperer un utilisateur par son id' })
  async getUserById(@Param('id') id: string) {
    const url = routesConfig.user.getUser.link(this.services.user, id);
    return this.httpProxy.get(url, 'Get user by id failed');
  }
}
