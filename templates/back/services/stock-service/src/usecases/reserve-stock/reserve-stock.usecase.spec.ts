import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReserveStockUseCase } from './reserve-stock.usecase';
import { IStockReservationRepository } from '../../repositories/stock-reservation.repository';
import { ReserveStockDto } from './reserve-stock.dto';
import { StockReservation } from '../../entities/stock-reservation.entity';

describe('ReserveStockUseCase', () => {
  let usecase: ReserveStockUseCase;
  let reservationRepo: jest.Mocked<IStockReservationRepository>;

  const mockReservationRepo = {
    reserveAll: jest.fn(),
    confirmByOrderId: jest.fn(),
    releaseByOrderId: jest.fn(),
    releaseExpired: jest.fn(),
    sumHeldByProductIds: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn().mockReturnValue(30),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReserveStockUseCase,
        { provide: IStockReservationRepository, useValue: mockReservationRepo },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    usecase = module.get<ReserveStockUseCase>(ReserveStockUseCase);
    reservationRepo = module.get(IStockReservationRepository);

    jest.clearAllMocks();
  });

  const dto: ReserveStockDto = {
    orderId: 'order-1',
    items: [{ productId: 'product-1', quantity: 2 }],
  };

  it('devrait réserver le stock et retourner les réservations créées', async () => {
    const reservations = [{ id: 'res-1', productId: 'product-1', quantity: 2 }] as StockReservation[];
    reservationRepo.reserveAll.mockResolvedValue({ ok: true, reservations });

    const result = await usecase.execute(dto);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(reservationRepo.reserveAll).toHaveBeenCalledWith(dto.orderId, dto.items, 30);
    expect(result).toEqual({
      message: 'Stock reserved successfully',
      reservations,
    });
  });

  it('devrait lever une BadRequestException avec le détail des manques si un item est insuffisant', async () => {
    reservationRepo.reserveAll.mockResolvedValue({
      ok: false,
      shortages: [{ productId: 'product-1', requested: 2, available: 1 }],
    });

    await expect(usecase.execute(dto)).rejects.toThrow(BadRequestException);

    try {
      await usecase.execute(dto);
    } catch (err) {
      expect((err as BadRequestException).getResponse()).toEqual(
        expect.objectContaining({
          shortages: [{ productId: 'product-1', requested: 2, available: 1 }],
        })
      );
    }
  });

  it('ne doit rien renvoyer comme réservation en cas de manque (tout ou rien)', async () => {
    reservationRepo.reserveAll.mockResolvedValue({
      ok: false,
      shortages: [{ productId: 'product-1', requested: 2, available: 0 }],
    });

    await expect(usecase.execute(dto)).rejects.toThrow(BadRequestException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(reservationRepo.confirmByOrderId).not.toHaveBeenCalled();
  });
});
