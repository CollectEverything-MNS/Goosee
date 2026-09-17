import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';
import { AskAssistantDto } from './ask-assistant.dto';

@ApiTags('Assistant')
@Controller()
export class AskAssistantController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  // Quota gratuit Gemini partage par tout le tenant : on borne par IP.
  @Post(routesConfig.assistant.ask.path)
  @UseGuards(ThrottlerGuard, JwtAuthGuard, RolesGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Roles('dashboard')
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Poser une question a l'assistant d'aide (base sur le guide utilisateur)",
  })
  async ask(@Body() dto: AskAssistantDto) {
    const url = routesConfig.assistant.ask.link(this.services.assistant);
    // Gemini dispose de 30 s côté service ; le proxy doit attendre sa réponse.
    return this.httpProxy.postWithConfig(url, dto, { timeout: 35_000 }, 'Ask assistant failed');
  }
}
