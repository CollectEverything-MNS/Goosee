import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmReservationUseCase } from './confirm-reservation.usecase';
import { IStockReservationRepository } from '../../repositories/stock-reservation.repository';

describe('ConfirmReservationUseCase', () => {
  let usecase: ConfirmReservationUseCase;
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
        ConfirmReservationUseCase,
        { provide: IStockReservationRepository, useValue: mockReservationRepo },
      ],
    }).compile();

    usecase = module.get<ConfirmReservationUseCase>(ConfirmReservationUseCase);
    reservationRepo = module.get(IStockReservationRepository);

    jest.clearAllMocks();
  });

  it('devrait confirmer les réservations `held` de la commande', async () => {
    reservationRepo.confirmByOrderId.mockResolvedValue(undefined);

    await usecase.execute('order-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(reservationRepo.confirmByOrderId).toHaveBeenCalledWith('order-1');
  });

  it("est idempotent : rejouer l'event ne doit pas lever d'erreur (aucune réservation `held` restante)", async () => {
    reservationRepo.confirmByOrderId.mockResolvedValue(undefined);

    await usecase.execute('order-1');
    await usecase.execute('order-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(reservationRepo.confirmByOrderId).toHaveBeenCalledTimes(2);
  });
});
