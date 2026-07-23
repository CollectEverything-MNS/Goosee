import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ReleaseReservationUseCase } from './release-reservation.usecase';

interface OrderCancelledPayload {
  orderId: string;
}

@Controller()
export class ReleaseReservationEventsListener {
  private readonly logger = new Logger(ReleaseReservationEventsListener.name);

  constructor(private readonly useCase: ReleaseReservationUseCase) {}

  @EventPattern('order.cancelled')
  async handle(@Payload() data: OrderCancelledPayload) {
    await this.useCase.execute(data.orderId);
    this.logger.log(`Réservation libérée pour la commande ${data.orderId}`);
  }
}
