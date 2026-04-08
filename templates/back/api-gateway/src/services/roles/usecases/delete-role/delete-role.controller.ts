import { Controller, Delete, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';

@ApiTags('Role')
@Controller()
export class DeleteRoleController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService,
  ) {
    this.services = serviceUrl(this.config);
  }

  @Delete(routesConfig.role.deleteRole.path)
  @ApiOperation({ summary: 'Supprimer un rôle' })
  async delete(@Param('id') id: string) {
    const url = routesConfig.role.deleteRole.link(this.services.user, id);
    return this.httpProxy.delete(url, 'Delete role failed');
  }
}
