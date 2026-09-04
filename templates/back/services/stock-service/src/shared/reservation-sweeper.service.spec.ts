import { Test, TestingModule } from '@nestjs/testing';
import { ReservationSweeperService } from './reservation-sweeper.service';
import { IStockReservationRepository } from '../repositories/stock-reservation.repository';

describe('ReservationSweeperService', () => {
  let service: ReservationSweeperService;
  let reservationRepo: jest.Mocked<IStockReservationRepository>;

  const mockReservationRepo = {
    reserveAll: jest.fn(),
    confirmByOrderId: jest.fn(),
    releaseByOrderId: jest.fn(),
    releaseExpired: jest.fn(),
    sumHeldByProductIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationSweeperService,
        { provide: IStockReservationRepository, useValue: mockReservationRepo },
      ],
    }).compile();

    service = module.get<ReservationSweeperService>(ReservationSweeperService);
    reservationRepo = module.get(IStockReservationRepository);

    jest.clearAllMocks();
  });

  it('devrait libérer les réservations `held` expirées à chaque passage', async () => {
    reservationRepo.releaseExpired.mockResolvedValue(3);

    await service.sweep();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(reservationRepo.releaseExpired).toHaveBeenCalledWith(expect.any(Date));
  });

  it("ne doit rien faire de plus si aucune réservation n'est expirée", async () => {
    reservationRepo.releaseExpired.mockResolvedValue(0);

    await expect(service.sweep()).resolves.not.toThrow();
  });
});
