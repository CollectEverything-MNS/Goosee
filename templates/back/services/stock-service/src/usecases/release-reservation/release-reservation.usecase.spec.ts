import { Test, TestingModule } from '@nestjs/testing';
import { ReleaseReservationUseCase } from './release-reservation.usecase';
import { IStockReservationRepository } from '../../repositories/stock-reservation.repository';

describe('ReleaseReservationUseCase', () => {
  let usecase: ReleaseReservationUseCase;
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
        ReleaseReservationUseCase,
        { provide: IStockReservationRepository, useValue: mockReservationRepo },
      ],
    }).compile();

    usecase = module.get<ReleaseReservationUseCase>(ReleaseReservationUseCase);
    reservationRepo = module.get(IStockReservationRepository);

    jest.clearAllMocks();
  });

  it('devrait libérer les réservations `held` de la commande annulée', async () => {
    reservationRepo.releaseByOrderId.mockResolvedValue(undefined);

    await usecase.execute('order-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(reservationRepo.releaseByOrderId).toHaveBeenCalledWith('order-1');
  });
});
