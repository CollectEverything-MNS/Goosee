import { Body, Controller, Get } from '@nestjs/common';
import { routesConfig } from 'src/config/routes.config';
import { GetUserDto } from './get-user.dto';
import { GetUserUseCase } from './get-user.usecase';
import {MessagePattern} from "@nestjs/microservices";

@Controller()
export class GetUserController {
  constructor(private readonly getUser: GetUserUseCase) {}

  @MessagePattern('getUser')
  @Get(routesConfig.user.byId)
  async handle(@Body() dto: GetUserDto) {
    return this.getUser.execute(dto);
  }
}
