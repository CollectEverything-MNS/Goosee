import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { RgpdService } from './rgpd.service';

describe('RgpdService', () => {
  let service: RgpdService;
  const mockHttp = { post: jest.fn(), get: jest.fn() };
  // Chaque cle de configuration se rend elle-meme : les URL construites par
  // serviceUrl portent alors le nom du service, ce qui rend la liste des cibles
  // verifiable.
  const mockConfig = { get: jest.fn((cle: string) => cle) };

  const urlsAppelees = (mock: jest.Mock): string[] =>
    mock.mock.calls.map((appel) => appel[0] as string);

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RgpdService,
        { provide: HttpService, useValue: mockHttp },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();
    service = module.get<RgpdService>(RgpdService);
  });

  it("un service en echec n empeche pas les autres et figure au bilan", async () => {
    mockHttp.post
      .mockReturnValueOnce(of({ data: { service: 'user', statut: 'efface' } }))
      .mockReturnValueOnce(throwError(() => new Error('service injoignable')))
      .mockReturnValue(of({ data: { service: 'autre', statut: 'efface' } }));

    const bilan = await service.erase('c-1');

    expect(bilan.customerId).toBe('c-1');
    expect(bilan.resultats.some((r) => r.statut === 'echec')).toBe(true);
    expect(bilan.resultats.filter((r) => r.statut !== 'echec').length).toBeGreaterThan(0);
  });

  it("un service en echec fait echouer tout l export (Promise.all, pas allSettled)", async () => {
    mockHttp.get
      .mockReturnValueOnce(of({ data: { compte: { id: 'c-1' } } }))
      .mockReturnValueOnce(throwError(() => new Error('service injoignable')))
      .mockReturnValue(of({ data: { commandes: [] } }));

    await expect(service.export('c-1')).rejects.toThrow('service injoignable');
  });

  // ticket-service n'est deploye que dans la pile de developpement : le declarer
  // comme cible produirait un echec permanent au bilan rendu au marchand.
  it("l effacement vise user, cart, order et log, jamais ticket", async () => {
    mockHttp.post.mockReturnValue(of({ data: { service: 'x', statut: 'efface' } }));

    const bilan = await service.erase('c-1');

    expect(bilan.resultats).toHaveLength(4);
    const urls = urlsAppelees(mockHttp.post);
    expect(urls).toHaveLength(4);
    expect(urls.some((u) => u.includes('USER_SERVICE_HOST'))).toBe(true);
    expect(urls.some((u) => u.includes('CART_SERVICE_HOST'))).toBe(true);
    expect(urls.some((u) => u.includes('ORDER_SERVICE_HOST'))).toBe(true);
    expect(urls.some((u) => u.includes('LOG_SERVICE_HOST'))).toBe(true);
    expect(urls.some((u) => u.includes('TICKET_SERVICE_HOST'))).toBe(false);
  });

  // Le bilan rendu au navigateur ne survit pas a l'onglet : sans trace serveur,
  // l'article 5.2 n'a rien a montrer.
  it("consigne l acteur, le customerId et le sort de chaque service", async () => {
    const journal = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    mockHttp.post
      .mockReturnValueOnce(of({ data: { service: 'user', statut: 'efface' } }))
      .mockReturnValueOnce(throwError(() => new Error('service injoignable')))
      .mockReturnValue(of({ data: { service: 'autre', statut: 'efface' } }));

    await service.erase('c-1', 'admin-7');

    expect(journal).toHaveBeenCalledTimes(1);
    const ligne = journal.mock.calls[0][0] as string;
    expect(ligne).toContain('admin-7');
    expect(ligne).toContain('c-1');
    expect(ligne).toContain('user:efface');
    expect(ligne).toContain('cart:echec');
    journal.mockRestore();
  });

  it("l export agrege user et order, jamais ticket", async () => {
    mockHttp.get.mockReturnValue(of({ data: {} }));

    await service.export('c-1');

    const urls = urlsAppelees(mockHttp.get);
    expect(urls).toHaveLength(2);
    expect(urls.some((u) => u.includes('USER_SERVICE_HOST'))).toBe(true);
    expect(urls.some((u) => u.includes('ORDER_SERVICE_HOST'))).toBe(true);
    expect(urls.some((u) => u.includes('TICKET_SERVICE_HOST'))).toBe(false);
  });
});
