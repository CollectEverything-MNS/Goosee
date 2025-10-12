import { Body, Controller, Post } from '@nestjs/common';
import { routesConfig } from 'src/config/routes.config';
import { CreateUserDto } from '../../applications/dtos/create-user.dto';
import { CreateUserUseCase } from '../../applications/usecases/create-user.usecase';

@Controller(routesConfig.user.root)
export class CreateUserController {
  constructor(private readonly createUser: CreateUserUseCase) {}

  @Post()
  async handle(@Body() dto: CreateUserDto) {
    return this.createUser.execute(dto);
  }
}
