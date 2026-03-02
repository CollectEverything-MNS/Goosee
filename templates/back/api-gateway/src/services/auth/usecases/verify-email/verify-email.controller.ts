import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from '../../../../config/services.config';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';

@ApiTags('Auth')
@Controller()
export class VerifyEmailController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.auth.verifyEmail.path)
  @ApiOperation({ summary: "Vérification de l'email" })
  async verifyEmail(@Query('token') token?: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    const baseUrl = routesConfig.auth.verifyEmail.link(this.services.auth);
    const url = `${baseUrl}?token=${encodeURIComponent(token)}`;
    return this.httpProxy.get(url, 'Email verification failed');
  }
}
