import { Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/services/jwt-auth.guard';
import { RolesGuard } from '../../shared/services/roles.guard';
import { Roles } from '../../shared/services/roles.decorator';
import { RgpdService } from './rgpd.service';

// Porte d'entree du back-office. Les routes `/internal/rgpd/*` portent le jeton
// interne, qu'un navigateur n'a pas : le marchand passe par ici, avec son jeton
// d'acces et l'habilitation `rgpd` que le proprietaire de la boutique delegue.
@ApiTags('RGPD')
@ApiBearerAuth()
@Controller('admin/rgpd')
export class AdminRgpdController {
  constructor(private readonly rgpdService: RgpdService) {}

  @Post('erase/:customerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('rgpd')
  @ApiOperation({ summary: "Effacer les donnees d'un acheteur" })
  @ApiResponse({ status: 201, description: "Bilan de l'effacement, service par service" })
  @ApiResponse({ status: 403, description: 'Habilitation rgpd manquante' })
  async erase(@Param('customerId', ParseUUIDPipe) customerId: string) {
    return this.rgpdService.erase(customerId);
  }

  @Get('export/:customerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('rgpd')
  @ApiOperation({ summary: "Exporter les donnees d'un acheteur" })
  @ApiResponse({ status: 200, description: "Donnees de l'acheteur, tous services confondus" })
  @ApiResponse({ status: 403, description: 'Habilitation rgpd manquante' })
  async export(@Param('customerId', ParseUUIDPipe) customerId: string) {
    return this.rgpdService.export(customerId);
  }
}
