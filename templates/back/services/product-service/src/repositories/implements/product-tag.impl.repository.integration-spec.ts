import { DataSource } from 'typeorm';
import { createTestDataSource, clearDatabase } from '../../test-utils/test-data-source';
import { TypeOrmProductTagRepository } from './product-tag.impl.repository';
import { ProductTag } from '../../entities/product-tag.entity';

describe('TypeOrmProductTagRepository (integration)', () => {
  let dataSource: DataSource;
  let repo: TypeOrmProductTagRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repo = new TypeOrmProductTagRepository(dataSource.getRepository(ProductTag));
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
  });

  const product1 = '11111111-1111-1111-1111-111111111111';
  const product2 = '22222222-2222-2222-2222-222222222222';
  const tag1 = '33333333-3333-3333-3333-333333333333';
  const tag2 = '44444444-4444-4444-4444-444444444444';

  const newRelation = (productId: string, tagId: string) =>
    Object.assign(new ProductTag(), { productId, tagId });

  it('devrait persister une relation produit-tag (clé composite)', async () => {
    await repo.save(newRelation(product1, tag1));

    const result = await repo.findOne(product1, tag1);

    expect(result).not.toBeNull();
  });

  it('findOne devrait retourner null si la relation n\'existe pas', async () => {
    expect(await repo.findOne(product1, tag1)).toBeNull();
  });

  it('findByProductId devrait retourner toutes les relations d\'un produit', async () => {
    await repo.save(newRelation(product1, tag1));
    await repo.save(newRelation(product1, tag2));
    await repo.save(newRelation(product2, tag1));

    const result = await repo.findByProductId(product1);

    expect(result).toHaveLength(2);
  });

  it('delete devrait supprimer uniquement la relation ciblée', async () => {
    await repo.save(newRelation(product1, tag1));
    await repo.save(newRelation(product1, tag2));

    await repo.delete(product1, tag1);

    expect(await repo.findOne(product1, tag1)).toBeNull();
    expect(await repo.findOne(product1, tag2)).not.toBeNull();
  });
});
