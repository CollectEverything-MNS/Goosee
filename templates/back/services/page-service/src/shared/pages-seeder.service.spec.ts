import { Test, TestingModule } from '@nestjs/testing';
import { PagesSeederService } from './pages-seeder.service';
import { SeedPagesUseCase } from '../usecases/seed-pages/seed-pages.usecase';

describe('PagesSeederService', () => {
  let service: PagesSeederService;
  let seedPagesUseCase: jest.Mocked<SeedPagesUseCase>;

  const mockSeedPagesUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagesSeederService,
        { provide: SeedPagesUseCase, useValue: mockSeedPagesUseCase },
      ],
    }).compile();

    service = module.get<PagesSeederService>(PagesSeederService);
    seedPagesUseCase = module.get(SeedPagesUseCase);

    jest.clearAllMocks();
  });

  describe('onApplicationBootstrap', () => {
    it('devrait déclencher le seed des pages au démarrage', async () => {
      seedPagesUseCase.execute.mockResolvedValue(undefined);

      await service.onApplicationBootstrap();

      expect(seedPagesUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('ne devrait pas empêcher le démarrage si le seed échoue', async () => {
      seedPagesUseCase.execute.mockRejectedValue(new Error('base indisponible'));

      await expect(service.onApplicationBootstrap()).resolves.toBeUndefined();
    });
  });
});
