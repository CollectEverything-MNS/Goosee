import { Body, Controller, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { UpdateRoleDto } from './update-role.dto';

@ApiTags('Role')
@Controller()
export class UpdateRoleController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService,
  ) {
    this.services = serviceUrl(this.config);
  }

  @Put(routesConfig.role.updateRole.path)
  @ApiOperation({ summary: 'Mettre à jour un rôle' })
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    const url = routesConfig.role.updateRole.link(this.services.user, id);
    return this.httpProxy.put(url, dto, 'Update role failed');
  }
}
