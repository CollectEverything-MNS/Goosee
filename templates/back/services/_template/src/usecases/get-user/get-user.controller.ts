import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetUserUseCase } from './get-user.usecase';

@Controller()
export class GetUserController {
  constructor(private readonly getUser: GetUserUseCase) {}

  @MessagePattern({ cmd: 'getUser' })
  async handle(@Payload() id: string) {
    return this.getUser.execute(id);
  }
}
