import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { AdminRgpdController } from './admin-rgpd.controller';
import { RgpdService } from './rgpd.service';
import { JwtAuthGuard } from '../../shared/services/jwt-auth.guard';
import { RolesGuard } from '../../shared/services/roles.guard';
import { ROLES_KEY } from '../../shared/services/roles.decorator';
import { JwtPayload } from '../../shared/services/jwt-payload.type';

describe('AdminRgpdController', () => {
  let controller: AdminRgpdController;
  const mockRgpd = { erase: jest.fn(), export: jest.fn() };
  const reflector = new Reflector();
  const acteur: JwtPayload = {
    sub: 'admin-7',
    email: 'admin@boutique.fr',
    roles: ['rgpd'],
    tokenVersion: 1,
    typ: 'access',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminRgpdController],
      providers: [{ provide: RgpdService, useValue: mockRgpd }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<AdminRgpdController>(AdminRgpdController);
  });

  it("l effacement relaie au service partage et rend le bilan service par service", async () => {
    const bilan = {
      customerId: 'c-1',
      resultats: [
        { service: 'user', statut: 'efface' },
        { service: 'log', statut: 'echec', raison: 'service injoignable' },
      ],
    };
    mockRgpd.erase.mockResolvedValue(bilan);

    await expect(controller.erase('c-1', acteur)).resolves.toBe(bilan);
    expect(mockRgpd.erase).toHaveBeenCalledWith('c-1', 'admin-7');
  });

  it("transmet l identifiant du demandeur au service, jamais son courriel", async () => {
    mockRgpd.erase.mockResolvedValue({ customerId: 'c-1', resultats: [] });

    await controller.erase('c-1', acteur);

    const args = mockRgpd.erase.mock.calls[0];
    expect(args).toEqual(['c-1', 'admin-7']);
    expect(JSON.stringify(args)).not.toContain('admin@boutique.fr');
  });

  it("l export relaie au service partage", async () => {
    const donnees = { exporteLe: '2026-09-14T00:00:00.000Z', compte: { id: 'c-1' } };
    mockRgpd.export.mockResolvedValue(donnees);

    await expect(controller.export('c-1')).resolves.toBe(donnees);
    expect(mockRgpd.export).toHaveBeenCalledWith('c-1');
  });

  it.each([
    ['erase', AdminRgpdController.prototype.erase],
    ['export', AdminRgpdController.prototype.export],
  ])('la route %s exige le jeton d acces et l habilitation rgpd', (_nom, handler) => {
    const guards = Reflect.getMetadata('__guards__', handler) ?? [];
    expect(guards).toContain(JwtAuthGuard);
    expect(guards).toContain(RolesGuard);
    expect(reflector.get<string[]>(ROLES_KEY, handler)).toEqual(['rgpd']);
  });
});
