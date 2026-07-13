import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { CreateTicketDto } from './create-ticket.dto';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';

@ApiTags('Ticket')
@Controller()
export class CreateTicketController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Post(routesConfig.ticket.createTicket.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tickets')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un ticket de support' })
  async create(@Body() dto: CreateTicketDto) {
    const url = routesConfig.ticket.createTicket.link(this.services.ticket);
    return this.httpProxy.post(url, dto, 'Create ticket failed');
  }
}
