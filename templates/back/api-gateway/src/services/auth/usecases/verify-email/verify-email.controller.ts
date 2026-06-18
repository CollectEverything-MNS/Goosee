import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
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
  async verifyEmail(@Res() res: Response, @Query('token') token?: string) {
    const webUrl = this.config.get<string>('NEXT_PUBLIC_WEB_URL', 'http://localhost:3000');

    if (!token) {
      return res.redirect(`${webUrl}/?verified=0`);
    }

    try {
      const baseUrl = routesConfig.auth.verifyEmail.link(this.services.auth);
      const url = `${baseUrl}?token=${encodeURIComponent(token)}`;
      await this.httpProxy.get(url, 'Email verification failed');
      return res.redirect(`${webUrl}/?verified=1`);
    } catch {
      return res.redirect(`${webUrl}/?verified=0`);
    }
  }
}
