import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { AssignTicketDto } from './assign-ticket.dto';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';

@ApiTags('Ticket')
@Controller()
export class AssignTicketController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Patch(routesConfig.ticket.assignTicket.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tickets')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assigner un ticket à un admin' })
  async assign(@Param('id') id: string, @Body() dto: AssignTicketDto) {
    const url = routesConfig.ticket.assignTicket.link(this.services.ticket, id);
    return this.httpProxy.patch(url, dto, 'Assign ticket failed');
  }
}
