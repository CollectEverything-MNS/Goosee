import { Injectable } from '@nestjs/common';
import { IStockReservationRepository } from '../../repositories/stock-reservation.repository';

@Injectable()
export class ReleaseReservationUseCase {
  constructor(private readonly reservationRepo: IStockReservationRepository) {}

  async execute(orderId: string): Promise<void> {
    await this.reservationRepo.releaseByOrderId(orderId);
  }
}
