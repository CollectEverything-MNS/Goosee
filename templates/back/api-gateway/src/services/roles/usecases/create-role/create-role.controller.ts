import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { CreateRoleDto } from './create-role.dto';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';

@ApiTags('Role')
@Controller()
export class CreateRoleController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService,
  ) {
    this.services = serviceUrl(this.config);
  }

  @Post(routesConfig.role.createRole.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('roles')
  @ApiOperation({ summary: 'Creer un role' })
  async create(@Body() dto: CreateRoleDto) {
    const url = routesConfig.role.createRole.link(this.services.user);
    return this.httpProxy.post(url, dto, 'Create role failed');
  }
}
