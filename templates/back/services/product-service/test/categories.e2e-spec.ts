import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, clearDatabase } from './utils/test-app';

describe('Categories (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(app);
  });

  it('POST /categories devrait créer une catégorie racine active par défaut', async () => {
    const response = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Vins Rouges' })
      .expect(201);

    expect(response.body.category.id).toBeDefined();
    expect(response.body.category.isActive).toBe(true);
  });

  it('POST /categories devrait retourner 400 si le body est invalide (nom manquant)', async () => {
    await request(app.getHttpServer()).post('/categories').send({}).expect(400);
  });

  it('GET /categories/:id devrait retourner la catégorie créée', async () => {
    const created = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Vins Rouges' });

    const response = await request(app.getHttpServer())
      .get(`/categories/${created.body.category.id}`)
      .expect(200);

    expect(response.body.category.name).toBe('Vins Rouges');
  });

  it('GET /categories/:id devrait retourner 404 pour un id inexistant', async () => {
    await request(app.getHttpServer())
      .get('/categories/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('PATCH /categories/:id devrait mettre à jour et persister le changement', async () => {
    const created = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Vins Rouges' });

    await request(app.getHttpServer())
      .patch(`/categories/${created.body.category.id}`)
      .send({ name: 'Vins Rouges Premium' })
      .expect(200);

    const response = await request(app.getHttpServer()).get(
      `/categories/${created.body.category.id}`,
    );
    expect(response.body.category.name).toBe('Vins Rouges Premium');
  });

  it('PATCH /categories/:id devrait retourner 400 si le nouveau parent a déjà un parent (règle 2 niveaux)', async () => {
    const root = await request(app.getHttpServer()).post('/categories').send({ name: 'Vins' });
    const child = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Vins Rouges', parentId: root.body.category.id });
    const other = await request(app.getHttpServer()).post('/categories').send({ name: 'Autre' });

    await request(app.getHttpServer())
      .patch(`/categories/${other.body.category.id}`)
      .send({ parentId: child.body.category.id })
      .expect(400);
  });

  it('PATCH /categories/:id devrait désactiver en cascade les enfants quand une catégorie racine est désactivée', async () => {
    const root = await request(app.getHttpServer()).post('/categories').send({ name: 'Vins' });
    const child = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Vins Rouges', parentId: root.body.category.id });

    await request(app.getHttpServer())
      .patch(`/categories/${root.body.category.id}`)
      .send({ isActive: false })
      .expect(200);

    const reloadedChild = await request(app.getHttpServer()).get(
      `/categories/${child.body.category.id}`,
    );
    expect(reloadedChild.body.category.isActive).toBe(false);
  });

  it('DELETE /categories/:id devrait retourner 400 si des produits sont rattachés', async () => {
    const category = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Vins Rouges' });

    await request(app.getHttpServer()).post('/products').send({
      name: 'Château Margaux',
      price: 100,
      initialStock: 5,
      categoryId: category.body.category.id,
    });

    await request(app.getHttpServer())
      .delete(`/categories/${category.body.category.id}`)
      .expect(400);
  });

  it('DELETE /categories/:id devrait supprimer une catégorie sans produit rattaché', async () => {
    const category = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Vins Rouges' });

    await request(app.getHttpServer())
      .delete(`/categories/${category.body.category.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/categories/${category.body.category.id}`)
      .expect(404);
  });
});
