import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { serviceUrl, ServiceUrls } from '../../../../config/services.config';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../../../shared/services/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/services/current-user.decorator';
import { JwtPayload } from '../../../../shared/services/jwt-payload.type';

@ApiTags('User')
@Controller()
export class GetMeController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService,
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get('/users/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Recuperer le profil de l\'utilisateur connecte' })
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.httpProxy.get(
      `${this.services.user}/users/by-auth/${user.sub}`,
      'Get current user failed',
    );
  }
}
