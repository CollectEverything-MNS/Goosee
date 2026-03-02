import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from '../../../../config/services.config';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';
import { ResendVerificationEmailDto } from './resend-verification-email.dto';

@ApiTags('Auth')
@Controller()
export class ResendVerificationEmailController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Post(routesConfig.auth.resendVerificationEmail.path)
  @ApiOperation({ summary: 'Renvoi de verification email' })
  async resend(@Body() dto: ResendVerificationEmailDto) {
    const url = routesConfig.auth.resendVerificationEmail.link(this.services.auth);
    return this.httpProxy.post(url, dto, 'Resend verification email failed');
  }
}
