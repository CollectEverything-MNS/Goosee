import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from '../../../../config/services.config';
import { ChangePasswordDto } from './change-password.dto';
import { routesConfig } from '../../../../config/routes.config';
import { JwtAuthGuard } from '../../../../shared/services/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/services/current-user.decorator';
import { JwtPayload } from '../../../../shared/services/jwt-payload.type';

@ApiTags('Auth')
@Controller()
export class ChangePasswordController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService,
  ) {
    this.services = serviceUrl(this.config);
  }

  @Put(routesConfig.auth.changePassword.path)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Changement de mot de passe de l'utilisateur connecte" })
  async changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: JwtPayload) {
    const url = routesConfig.auth.changePassword.link(this.services.auth);
    return this.httpProxy.put(
      url,
      {
        authId: user.sub,
        ...dto,
      },
      'Change password failed',
    );
  }
}
