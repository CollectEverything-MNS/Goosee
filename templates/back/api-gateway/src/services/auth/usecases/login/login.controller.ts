import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { LoginDto } from './login.dto';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';

interface LoginResponse {
  token: string;
  expiredAt: string;
}

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
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const url = routesConfig.auth.login.link(this.services.auth);
    const result = await this.httpProxy.post<LoginResponse>(url, dto, 'Login failed');

    // Stocker le token dans un cookie HTTP-only pour le protéger contre les
    // attaques XSS. Le navigateur l'enverra automatiquement sur chaque requête
    // grâce à withCredentials: true côté frontend.
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      expires: new Date(result.expiredAt),
      path: '/',
    });

    return result;
  }
}
