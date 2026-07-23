import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ConfirmReservationUseCase } from './confirm-reservation.usecase';

interface OrderPaidPayload {
  orderId: string;
}

@Controller()
export class ConfirmReservationEventsListener {
  private readonly logger = new Logger(ConfirmReservationEventsListener.name);

  constructor(private readonly useCase: ConfirmReservationUseCase) {}

  @EventPattern('order.paid')
  async handle(@Payload() data: OrderPaidPayload) {
    await this.useCase.execute(data.orderId);
    this.logger.log(`Réservation confirmée pour la commande ${data.orderId}`);
  }
}
