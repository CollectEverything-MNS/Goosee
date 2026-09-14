import { Test, TestingModule } from '@nestjs/testing';
import { SeedPagesUseCase } from './seed-pages.usecase';
import { IPageRepository } from '../../repositories/page.repository';
import { IMenuRepository } from '../../repositories/menu.repository';
import { DEFAULT_PAGES } from '../../seeds/default-pages.seed';
import { Page } from '../../entities/page.entity';

describe('SeedPagesUseCase', () => {
  let usecase: SeedPagesUseCase;
  let pageRepository: jest.Mocked<IPageRepository>;
  let menuRepository: jest.Mocked<IMenuRepository>;

  const mockPageRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findByType: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockMenuRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByParentId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    reorder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedPagesUseCase,
        { provide: IPageRepository, useValue: mockPageRepository },
        { provide: IMenuRepository, useValue: mockMenuRepository },
      ],
    }).compile();

    usecase = module.get<SeedPagesUseCase>(SeedPagesUseCase);
    pageRepository = module.get(IPageRepository);
    menuRepository = module.get(IMenuRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockCreatedPage = () =>
      pageRepository.create.mockImplementation(
        async (page) => ({ ...page, id: `id-${page.slug}` }) as Page,
      );

    it('ne devrait rien créer si des pages existent déjà', async () => {
      pageRepository.findAll.mockResolvedValue([{ id: 'page-1' } as Page]);

      await usecase.execute();

      expect(pageRepository.create).not.toHaveBeenCalled();
      expect(menuRepository.create).not.toHaveBeenCalled();
    });

    it('devrait créer toutes les pages par défaut sur une base vide', async () => {
      pageRepository.findAll.mockResolvedValue([]);
      mockCreatedPage();

      await usecase.execute();

      expect(pageRepository.create).toHaveBeenCalledTimes(DEFAULT_PAGES.length);
    });

    it('devrait créer une entrée de menu footer pour chaque page légale', async () => {
      pageRepository.findAll.mockResolvedValue([]);
      mockCreatedPage();

      await usecase.execute();

      expect(menuRepository.create).toHaveBeenCalledTimes(2);
      expect(menuRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Mentions légales',
          pageId: 'id-mentions-legales',
          isActive: true,
        }),
      );
      expect(menuRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Politique de confidentialité',
          pageId: 'id-politique-de-confidentialite',
          isActive: true,
        }),
      );
    });

    it('ne devrait pas créer de menu pour les pages non légales', async () => {
      pageRepository.findAll.mockResolvedValue([]);
      mockCreatedPage();

      await usecase.execute();

      const labels = menuRepository.create.mock.calls.map((call) => call[0].label);
      expect(labels).not.toContain('Accueil');
      expect(labels).not.toContain('Catalogue');
      expect(labels).not.toContain('Contact');
    });
  });
});
