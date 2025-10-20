import { Controller, Get, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { routesConfig } from "../../../../config/routes.config";

@ApiTags('User')
@Controller()
export class GetUserController {
    constructor(
        @Inject('USER_SERVICE') private readonly userService: ClientProxy,
    ) {}

    @Get(routesConfig.user.byId)
    @ApiOperation({
        summary: "Récupère les informations de l'utilisateur",
    })
    @ApiParam({
        name: 'id',
        description: "ID de l'utilisateur",
        example: '123',
    })
    getUser(@Param('id') id: string) {
        return this.userService.send(
            { cmd: 'getUser' },
            id,
        );
    }
}