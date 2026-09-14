import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { RgpdController } from './rgpd.controller';

describe('RgpdController', () => {
  let controller: RgpdController;
  const mockHttp = { post: jest.fn(), get: jest.fn() };
  const mockConfig = { get: jest.fn().mockReturnValue('jeton') };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RgpdController],
      providers: [
        { provide: HttpService, useValue: mockHttp },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();
    controller = module.get<RgpdController>(RgpdController);
  });

  it("un service en echec n empeche pas les autres et figure au bilan", async () => {
    mockHttp.post
      .mockReturnValueOnce(of({ data: { service: 'user', statut: 'efface' } }))
      .mockReturnValueOnce(throwError(() => new Error('service injoignable')))
      .mockReturnValue(of({ data: { service: 'autre', statut: 'efface' } }));

    const bilan = await controller.erase('c-1');

    expect(bilan.customerId).toBe('c-1');
    expect(bilan.resultats.some((r) => r.statut === 'echec')).toBe(true);
    expect(bilan.resultats.filter((r) => r.statut !== 'echec').length).toBeGreaterThan(0);
  });

  it("un service en echec fait echouer tout l export (Promise.all, pas allSettled)", async () => {
    mockHttp.get
      .mockReturnValueOnce(of({ data: { compte: { id: 'c-1' } } }))
      .mockReturnValueOnce(throwError(() => new Error('service injoignable')))
      .mockReturnValue(of({ data: { commandes: [] } }));

    await expect(controller.export('c-1')).rejects.toThrow('service injoignable');
  });
});
