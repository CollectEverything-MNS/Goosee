import { Test, TestingModule } from '@nestjs/testing';
import { IRoleRepository } from '../repositories/role.repository';
import { Role } from '../entities/role.entity';
import { RoleSeederService } from './role-seeder.service';

describe('RoleSeederService', () => {
  let service: RoleSeederService;
  const mockRepo = {
    findByName: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRepo.save.mockImplementation((role: Role) => Promise.resolve(role));
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleSeederService, { provide: IRoleRepository, useValue: mockRepo }],
    }).compile();
    service = module.get<RoleSeederService>(RoleSeederService);
  });

  it("le role OWNER recoit l habilitation rgpd au seed", async () => {
    mockRepo.findByName.mockResolvedValue(null);

    await service.onApplicationBootstrap();

    const owner = mockRepo.save.mock.calls
      .map(([role]: [Role]) => role)
      .find((role) => role.name === 'OWNER');
    expect(owner?.pageKeys).toContain('rgpd');
  });

  it("le role CUSTOMER ne recoit aucune habilitation", async () => {
    mockRepo.findByName.mockResolvedValue(null);

    await service.onApplicationBootstrap();

    const customer = mockRepo.save.mock.calls
      .map(([role]: [Role]) => role)
      .find((role) => role.name === 'CUSTOMER');
    expect(customer?.pageKeys).toEqual([]);
  });

  it("un OWNER systeme deja en base est resynchronise avec l habilitation rgpd", async () => {
    const existant = new Role();
    existant.name = 'OWNER';
    existant.isSystem = true;
    existant.pageKeys = ['dashboard'];
    mockRepo.findByName.mockImplementation((name: string) =>
      Promise.resolve(name === 'OWNER' ? existant : null),
    );

    await service.onApplicationBootstrap();

    expect(existant.pageKeys).toContain('rgpd');
    expect(mockRepo.save).toHaveBeenCalledWith(existant);
  });
});
