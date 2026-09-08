import { DataSource } from 'typeorm';
import { createTestDataSource, clearDatabase } from '../../test-utils/test-data-source';
import { TypeOrmTagRepository } from './tag.impl.repository';
import { TypeOrmProductTagRepository } from './product-tag.impl.repository';
import { Tag } from '../../entities/tag.entity';
import { ProductTag } from '../../entities/product-tag.entity';

describe('TypeOrmTagRepository (integration)', () => {
  let dataSource: DataSource;
  let repo: TypeOrmTagRepository;
  let productTagRepo: TypeOrmProductTagRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repo = new TypeOrmTagRepository(dataSource.getRepository(Tag));
    productTagRepo = new TypeOrmProductTagRepository(dataSource.getRepository(ProductTag));
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
  });

  it('devrait persister un tag et générer id/createdAt', async () => {
    const saved = await repo.save(new Tag({ name: 'Bio', slug: 'bio' }));

    expect(saved.id).toBeDefined();
    expect(saved.createdAt).toBeInstanceOf(Date);
  });

  it('findBySlug devrait retrouver un tag par son slug', async () => {
    const saved = await repo.save(new Tag({ name: 'Bio', slug: 'bio' }));

    const result = await repo.findBySlug('bio');

    expect(result?.id).toBe(saved.id);
  });

  it('findBySlug devrait retourner null si aucun tag ne correspond', async () => {
    expect(await repo.findBySlug('inexistant')).toBeNull();
  });

  it('deleteById devrait supprimer définitivement le tag', async () => {
    const saved = await repo.save(new Tag({ name: 'Bio', slug: 'bio' }));

    await repo.deleteById(saved.id);

    expect(await repo.findById(saved.id)).toBeNull();
  });

  it('findByProductId devrait retourner les tags liés à un produit via product_tag', async () => {
    const productId = '11111111-1111-1111-1111-111111111111';
    const tag = await repo.save(new Tag({ name: 'Bio', slug: 'bio' }));
    await repo.save(new Tag({ name: 'Sans gluten', slug: 'sans-gluten' }));
    await productTagRepo.save(
      Object.assign(new ProductTag(), { productId, tagId: tag.id }),
    );

    const result = await repo.findByProductId(productId);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(tag.id);
  });
});
