import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';

@ApiTags('Ticket')
@Controller()
export class GetTicketController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.ticket.getTicket.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tickets')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer un ticket par son identifiant' })
  async get(@Param('id') id: string) {
    const url = routesConfig.ticket.getTicket.link(this.services.ticket, id);
    return this.httpProxy.get(url, 'Get ticket failed');
  }
}
