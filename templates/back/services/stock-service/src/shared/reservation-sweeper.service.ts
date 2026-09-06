import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IStockReservationRepository } from '../repositories/stock-reservation.repository';

@Injectable()
export class ReservationSweeperService {
  private readonly logger = new Logger(ReservationSweeperService.name);

  constructor(private readonly reservationRepo: IStockReservationRepository) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sweep(): Promise<void> {
    const released = await this.reservationRepo.releaseExpired(new Date());
    if (released > 0) {
      this.logger.log(`${released} réservation(s) expirée(s) libérée(s)`);
    }
  }
}
