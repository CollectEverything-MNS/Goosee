import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';

@ApiTags('Assistant')
@Controller()
export class GetGuideController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.assistant.guide.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('dashboard')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Recuperer le guide utilisateur (documentation fonctionnelle, Markdown)',
  })
  async getGuide() {
    const url = routesConfig.assistant.guide.link(this.services.assistant);
    return this.httpProxy.get(url, 'Get guide failed');
  }
}
