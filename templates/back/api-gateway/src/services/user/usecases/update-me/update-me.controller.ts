import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { serviceUrl, ServiceUrls } from '../../../../config/services.config';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';
import { JwtAuthGuard } from '../../../../shared/services/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/services/current-user.decorator';
import { JwtPayload } from '../../../../shared/services/jwt-payload.type';
import { UpdateMeDto } from './update-me.dto';

@ApiTags('User')
@Controller()
export class UpdateMeController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService,
  ) {
    this.services = serviceUrl(this.config);
  }

  @Patch('/users/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre a jour le profil de l\'utilisateur connecte' })
  async updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateMeDto) {
    const current = await this.httpProxy.get<{ id: string }>(
      `${this.services.user}/users/by-auth/${user.sub}`,
      'Get current user failed',
    );
    return this.httpProxy.patch(
      `${this.services.user}/users/${current.id}`,
      dto,
      'Update current user failed',
    );
  }
}
