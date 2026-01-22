import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './login.dto';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';

@ApiTags('Auth')
@Controller()
export class LoginController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Post(routesConfig.auth.login.path)
  @ApiOperation({ summary: "Connexion d'un utilisateur" })
  async login(@Body() dto: LoginDto) {
    const url = routesConfig.auth.login.link(this.services.auth);
    return this.httpProxy.post(url, dto, 'Login failed');
  }
}
