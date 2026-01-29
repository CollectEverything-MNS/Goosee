import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './register.dto';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from '../../../../config/services.config';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';

@ApiTags('Auth')
@Controller()
export class RegisterController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Post(routesConfig.auth.register.path)
  @ApiOperation({ summary: "Inscription d'un utilisateur" })
  async register(@Body() dto: RegisterDto) {
    const url = routesConfig.auth.register.link(this.services.auth);
    return this.httpProxy.post(url, dto, 'Registration failed');
  }
}
