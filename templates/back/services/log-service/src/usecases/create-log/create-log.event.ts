import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateLogPayload, CreateLogUseCase } from './create-log.usecase';

@Controller()
export class CreateLogEventsListener {
  private readonly logger = new Logger(CreateLogEventsListener.name);

  constructor(private readonly createLogUseCase: CreateLogUseCase) {}

  @EventPattern('log.created')
  async handleLogCreated(@Payload() data: CreateLogPayload) {
    try {
      await this.createLogUseCase.execute(data);
    } catch (err) {
      this.logger.error(
        `Échec de la persistance du log : ${(err as Error).message}`
      );
    }
  }
}
