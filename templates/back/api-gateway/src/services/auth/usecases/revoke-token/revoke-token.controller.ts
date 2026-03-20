import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { RevokeTokenDto } from './revoke-token.dto';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from '../../../../config/services.config';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';

@ApiTags('Auth')
@Controller()
export class RevokeTokenController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Post(routesConfig.auth.token.revoke.path)
  @ApiOperation({ summary: 'Suppression du token' })
  async revoke(
    @Body() dto: RevokeTokenDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const url = routesConfig.auth.token.revoke.link(this.services.auth);
    const result = await this.httpProxy.post(url, dto, 'Revoke token failed');

    // Supprimer le cookie HTTP-only côté serveur lors de la déconnexion.
    // Le client ne peut pas le supprimer lui-même puisque httpOnly l'empêche
    // d'y accéder via JavaScript.
    res.clearCookie('token', { path: '/' });

    return result;
  }
}
