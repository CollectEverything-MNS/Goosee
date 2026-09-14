import { Test, TestingModule } from '@nestjs/testing';
import { RgpdEraseUseCase } from './rgpd-erase.usecase';
import { IOrderRepository } from '../../repositories/order.repository';
import { TypeOrmOrderRepository } from '../../repositories/implements/order.impl.repository';

describe('RgpdEraseUseCase (order)', () => {
  let usecase: RgpdEraseUseCase;
  const mockOrderRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    findByCustomer: jest.fn(),
    findByCustomerIncludingArchived: jest.fn(),
    listArchived: jest.fn(),
    archiveByCustomerId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [RgpdEraseUseCase, { provide: IOrderRepository, useValue: mockOrderRepo }],
    }).compile();
    usecase = module.get<RgpdEraseUseCase>(RgpdEraseUseCase);
  });

  it('archive les commandes sans les effacer', async () => {
    mockOrderRepo.archiveByCustomerId.mockResolvedValue(3);

    const res = await usecase.execute('c-1');

    expect(mockOrderRepo.archiveByCustomerId).toHaveBeenCalledWith('c-1', expect.any(Date));
    expect(res).toEqual({ service: 'order', statut: 'archive', commandes: 3 });
  });

  it("n'expose aucune methode de suppression de commande", () => {
    // Une facture doit porter nom et adresse pour rester valable : l'effacement
    // serait une faute, pas une precaution.
    //
    // L'assertion porte sur le depot reel, pas sur le mock que ce fichier
    // ecrit lui-meme : un mock ne peut attester que de sa propre redaction. Les
    // methodes abstraites d'IOrderRepository n'existant pas a l'execution, seul
    // le prototype de l'implementation concrete peut etre interroge.
    const suppression = /delete|remove/i;
    const methodes = Object.getOwnPropertyNames(TypeOrmOrderRepository.prototype).filter(
      (nom) => nom !== 'constructor',
    );

    // Le depot expose bien des methodes : le filtre ci-dessous ne passe pas
    // par vacuite.
    expect(methodes.length).toBeGreaterThan(0);
    expect(methodes.filter((nom) => suppression.test(nom))).toEqual([]);
  });
});
