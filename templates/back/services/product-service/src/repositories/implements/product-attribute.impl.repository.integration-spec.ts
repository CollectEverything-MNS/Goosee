import { DataSource } from 'typeorm';
import { createTestDataSource, clearDatabase } from '../../test-utils/test-data-source';
import { TypeOrmProductAttributeRepository } from './product-attribute.impl.repository';
import { ProductAttribute } from '../../entities/product-attribute.entity';

describe('TypeOrmProductAttributeRepository (integration)', () => {
  let dataSource: DataSource;
  let repo: TypeOrmProductAttributeRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repo = new TypeOrmProductAttributeRepository(dataSource.getRepository(ProductAttribute));
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
  });

  const newAttribute = (overrides: Partial<ProductAttribute> = {}) =>
    Object.assign(new ProductAttribute(), {
      productId: 'product-1',
      key: 'millésime',
      value: '2019',
      ...overrides,
    });

  it('devrait persister un attribut et générer un id', async () => {
    const saved = await repo.save(newAttribute());

    expect(saved.id).toBeDefined();
  });

  it('findById devrait retourner null pour un id inexistant', async () => {
    expect(await repo.findById('00000000-0000-0000-0000-000000000000')).toBeNull();
  });

  it('listByProductId devrait filtrer par produit', async () => {
    const matching = await repo.save(newAttribute({ productId: 'product-1' }));
    await repo.save(newAttribute({ productId: 'product-2' }));

    const result = await repo.listByProductId('product-1');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(matching.id);
  });

  it('deleteById devrait supprimer l\'attribut', async () => {
    const saved = await repo.save(newAttribute());

    await repo.deleteById(saved.id);

    expect(await repo.findById(saved.id)).toBeNull();
  });
});
