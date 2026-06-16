import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ForgetPasswordRequestDto } from './forget-password-request.dto';
import { routesConfig } from '../../../../config/routes.config';
import { HttpProxyService } from '../../../../shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';

@ApiTags('Auth')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Controller()
export class ForgetPasswordRequestController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Put(routesConfig.auth.forgetPasswordRequest.path)
  @ApiOperation({ summary: 'Mot de passe oublié demande' })
  async forgetPasswordRequest(@Body() dto: ForgetPasswordRequestDto) {
    const url = routesConfig.auth.forgetPasswordRequest.link(this.services.auth);
    return this.httpProxy.put(url, dto, 'Forget password request failed');
  }
}
