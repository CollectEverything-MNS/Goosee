import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';
import { CreatePaymentDto } from './create-payment.dto';

@ApiTags('Payments')
@Controller()
export class CreatePaymentController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  // Public : le checkout crée l'intention de paiement (renvoie le clientSecret au front).
  @Post(routesConfig.payment.createPayment.path)
  @ApiOperation({ summary: "Création d'une intention de paiement" })
  async create(@Body() dto: CreatePaymentDto) {
    const url = routesConfig.payment.createPayment.link(this.services.payment);
    return this.httpProxy.post(url, dto, 'Create payment failed');
  }
}
