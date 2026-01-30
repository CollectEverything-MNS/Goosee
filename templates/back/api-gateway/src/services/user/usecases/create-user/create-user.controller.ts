import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { routesConfig } from '../../../../config/routes.config';

import { CreateUserDto } from './create-user.dto';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';

@ApiTags('User')
@Controller()
export class CreateUserController {
  private readonly services: ServiceUrls;
  
  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Post(routesConfig.user.createUser.path)
  @ApiOperation({ summary: "Création d'un utilisateur" })
  async createUser(@Body() dto: CreateUserDto) {
    const url = routesConfig.user.createUser.link(this.services.user);
    return this.httpProxy.post(url, dto, 'Create user failed');
  }
}
