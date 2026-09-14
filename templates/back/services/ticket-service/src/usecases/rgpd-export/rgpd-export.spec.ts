import { Test, TestingModule } from '@nestjs/testing';
import { RgpdExportUseCase } from './rgpd-export.usecase';
import { ITicketRepository } from '../../repositories/ticket.repository';
import { TicketStatus } from '../../entities/ticket.entity';

describe('RgpdExportUseCase', () => {
  let usecase: RgpdExportUseCase;
  let mockTicketRepo: jest.Mocked<ITicketRepository>;

  beforeEach(async () => {
    mockTicketRepo = {
      findByAuthorId: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RgpdExportUseCase,
        {
          provide: ITicketRepository,
          useValue: mockTicketRepo,
        },
      ],
    }).compile();

    usecase = module.get<RgpdExportUseCase>(RgpdExportUseCase);
  });

  it('restitue les tickets avec sujet, date et statut', async () => {
    mockTicketRepo.findByAuthorId.mockResolvedValue([
      {
        id: 'tkt-1',
        title: 'Mon probleme',
        description: 'Details',
        authorId: 'c-1',
        authorEmail: 'test@test.fr',
        status: TicketStatus.CREATED,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ]);

    const res = await usecase.execute('c-1');

    expect(res.tickets).toHaveLength(1);
    expect(res.tickets[0].sujet).toBe('Mon probleme');
    expect(res.tickets[0].statut).toBe(TicketStatus.CREATED);
  });

  // Article 20 : le texte libre ecrit par la personne est precisement ce que la
  // restitution doit contenir.
  it('restitue la description et le commentaire ecrits par la personne', async () => {
    mockTicketRepo.findByAuthorId.mockResolvedValue([
      {
        id: 'tkt-1',
        title: 'Mon probleme',
        description: 'Le colis est arrive ouvert',
        comment: 'Je prefere un remboursement',
        authorId: 'c-1',
        authorEmail: 'test@test.fr',
        status: TicketStatus.CREATED,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ]);

    const res = await usecase.execute('c-1');

    expect(res.tickets[0].description).toBe('Le colis est arrive ouvert');
    expect(res.tickets[0].commentaire).toBe('Je prefere un remboursement');
  });

  it('rend un commentaire absent explicitement nul', async () => {
    mockTicketRepo.findByAuthorId.mockResolvedValue([
      {
        id: 'tkt-1',
        title: 'Mon probleme',
        description: 'Details',
        authorId: 'c-1',
        authorEmail: 'test@test.fr',
        status: TicketStatus.CREATED,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ]);

    const res = await usecase.execute('c-1');

    expect(res.tickets[0].commentaire).toBeNull();
  });

  it('utilise findByAuthorId pour recuperer les tickets', async () => {
    mockTicketRepo.findByAuthorId.mockResolvedValue([]);

    await usecase.execute('c-1');

    expect(mockTicketRepo.findByAuthorId).toHaveBeenCalledWith('c-1');
  });
});
