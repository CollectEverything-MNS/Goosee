import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStockReservationRepository } from '../../repositories/stock-reservation.repository';
import { ReserveStockDto } from './reserve-stock.dto';

@Injectable()
export class ReserveStockUseCase {
  constructor(
    private readonly reservationRepo: IStockReservationRepository,
    private readonly config: ConfigService
  ) {}

  async execute(dto: ReserveStockDto) {
    const ttlMinutes = Number(this.config.get('STOCK_RESERVATION_TTL_MINUTES', 30));

    const result = await this.reservationRepo.reserveAll(dto.orderId, dto.items, ttlMinutes);

    if (!result.ok) {
      throw new BadRequestException({
        message: 'Stock insuffisant pour un ou plusieurs produits',
        shortages: result.shortages,
      });
    }

    return {
      message: 'Stock reserved successfully',
      reservations: result.reservations,
    };
  }
}
