import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
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
export class DeleteUserController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService,
  ) {
    this.services = serviceUrl(this.config);
  }

  @Delete(routesConfig.user.deleteUser.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('users')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  async deleteUser(@Param('id') id: string) {
    const url = routesConfig.user.deleteUser.link(this.services.user, id);
    return this.httpProxy.delete(url, 'Delete user failed');
  }
}
