import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { GetUserService } from './get-user.service';
import { routesConfig } from '../../../../config/routes.config';

@ApiTags('Users')
@Controller()
export class GetUserController {
    constructor(private readonly getUserService: GetUserService) {}

    @Get(routesConfig.user.byId.path)
    @ApiOperation({ summary: "Récupère les informations d'un utilisateur" })
    @ApiParam({ name: 'id', example: '123' })
    async getUser(@Param('id') id: string) {
        return this.getUserService.execute(id);
    }
}
