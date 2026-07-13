import { Controller, Get, UseGuards } from '@nestjs/common';
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
export class ListTicketsController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.ticket.listTickets.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tickets')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister les tickets de support' })
  async list() {
    const url = routesConfig.ticket.listTickets.link(this.services.ticket);
    return this.httpProxy.get(url, 'List tickets failed');
  }
}
