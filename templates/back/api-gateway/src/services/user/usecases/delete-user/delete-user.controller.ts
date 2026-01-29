import { Controller, Delete, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { routesConfig } from '../../../../config/routes.config';

import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('User')
@Controller()
export class DeleteUserController {
  private readonly services: ServiceUrls;
  
  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Delete(routesConfig.user.deleteUser.path)
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  async deleteUser(@Param('id') id: string) {
    const url = routesConfig.user.deleteUser.link(this.services.user, id);
    return this.httpProxy.delete(url, 'Delete user failed');
  }
}
