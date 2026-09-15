import { Test, TestingModule } from '@nestjs/testing';
import { RgpdController } from './rgpd.controller';
import { RgpdService } from '../services/rgpd/rgpd.service';
import { InternalTokenGuard } from '../shared/internal-token.guard';

describe('RgpdController', () => {
  let controller: RgpdController;
  const mockRgpd = { erase: jest.fn(), export: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RgpdController],
      providers: [{ provide: RgpdService, useValue: mockRgpd }],
    }).compile();
    controller = module.get<RgpdController>(RgpdController);
  });

  it("l effacement relaie au service partage et rend son bilan", async () => {
    const bilan = { customerId: 'c-1', resultats: [{ service: 'user', statut: 'efface' }] };
    mockRgpd.erase.mockResolvedValue(bilan);

    await expect(controller.erase('c-1')).resolves.toBe(bilan);
    expect(mockRgpd.erase).toHaveBeenCalledWith('c-1', 'service-interne');
  });

  it("l export relaie au service partage et rend ses donnees", async () => {
    const donnees = { exporteLe: '2026-09-14T00:00:00.000Z' };
    mockRgpd.export.mockResolvedValue(donnees);

    await expect(controller.export('c-1')).resolves.toBe(donnees);
    expect(mockRgpd.export).toHaveBeenCalledWith('c-1');
  });

  it('reste ferme derriere le jeton interne', () => {
    const guards = Reflect.getMetadata('__guards__', RgpdController) ?? [];
    expect(guards).toContain(InternalTokenGuard);
  });
});
