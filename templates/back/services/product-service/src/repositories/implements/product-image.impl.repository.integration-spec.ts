import { DataSource } from 'typeorm';
import { createTestDataSource, clearDatabase } from '../../test-utils/test-data-source';
import { TypeOrmProductImageRepository } from './product-image.impl.repository';
import { ProductImage } from '../../entities/product-image.entity';

describe('TypeOrmProductImageRepository (integration)', () => {
  let dataSource: DataSource;
  let repo: TypeOrmProductImageRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repo = new TypeOrmProductImageRepository(dataSource.getRepository(ProductImage));
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
  });

  const newImage = (overrides: Partial<ProductImage> = {}) =>
    new ProductImage({
      productId: 'product-1',
      url: 'http://minio/products/a.png',
      isMain: false,
      order: 0,
      ...overrides,
    });

  it('devrait persister une image et générer id/createdAt', async () => {
    const saved = await repo.save(newImage());

    expect(saved.id).toBeDefined();
    expect(saved.createdAt).toBeInstanceOf(Date);
  });

  it('listByProductId devrait trier par order ASC', async () => {
    const second = await repo.save(newImage({ order: 1 }));
    const first = await repo.save(newImage({ order: 0 }));

    const result = await repo.listByProductId('product-1');

    expect(result.map((i) => i.id)).toEqual([first.id, second.id]);
  });

  it('clearMainByProductId devrait mettre isMain à false pour toutes les images du produit', async () => {
    const image1 = await repo.save(newImage({ isMain: true, order: 0 }));
    const image2 = await repo.save(newImage({ isMain: true, order: 1 }));
    await repo.save(newImage({ productId: 'product-2', isMain: true }));

    await repo.clearMainByProductId('product-1');

    const [reloaded1, reloaded2] = await Promise.all([
      repo.findById(image1.id),
      repo.findById(image2.id),
    ]);
    expect(reloaded1?.isMain).toBe(false);
    expect(reloaded2?.isMain).toBe(false);

    const untouched = await repo.listByProductId('product-2');
    expect(untouched[0].isMain).toBe(true);
  });

  it('deleteById devrait supprimer l\'image', async () => {
    const saved = await repo.save(newImage());

    await repo.deleteById(saved.id);

    expect(await repo.findById(saved.id)).toBeNull();
  });
});
