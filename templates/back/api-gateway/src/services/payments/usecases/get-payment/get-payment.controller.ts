import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';

@ApiTags('Payments')
@Controller()
export class GetPaymentController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.payment.getPayment.path)
  @ApiOperation({ summary: "Récupération d'un paiement" })
  async get(@Param('id') id: string) {
    const url = routesConfig.payment.getPayment.link(this.services.payment, id);
    return this.httpProxy.get(url, 'Get payment failed');
  }
}
