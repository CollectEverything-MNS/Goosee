import { Controller, Get } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { GetUserUseCase } from './get-user.usecase';
import { routesConfig } from '../../config/routes.config';

@Controller()
export class GetUserController {
  constructor(private readonly getUserUseCase: GetUserUseCase) {}

  @Get(routesConfig.user.byId)
  async getUser(@Payload() id: string) {
    return this.getUserUseCase.execute(id);
  }
}
