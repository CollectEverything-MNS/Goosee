import { Body, Controller, Post } from '@nestjs/common';
import { routesConfig } from 'src/config/routes.config';
import { CreateUserDto } from './create-user.dto';
import { CreateUserUseCase } from './create-user.usecase';

@Controller(routesConfig.user.root)
export class CreateUserController {
  constructor(private readonly createUser: CreateUserUseCase) {}

  @Post()
  async handle(@Body() dto: CreateUserDto) {
    return this.createUser.execute(dto);
  }
}
