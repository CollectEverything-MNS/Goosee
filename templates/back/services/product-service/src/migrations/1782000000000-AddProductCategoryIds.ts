import { MigrationInterface, QueryRunner } from 'typeorm';

// Ajoute la colonne multi-categories `categoryIds` (array) introduite dans l'entite Product.
// Sans cette migration, les bases des tenants (NODE_ENV=production => migrationsRun, pas de
// synchronize) n'ont pas la colonne et le product-service crashe au boot (SELECT categoryIds).
export class AddProductCategoryIds1782000000000 implements MigrationInterface {
  name = 'AddProductCategoryIds1782000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "categoryIds" text array NOT NULL DEFAULT '{}'`
    );
    // Retrocompat : initialise la liste avec la categorie principale pour les produits existants.
    await queryRunner.query(
      `UPDATE "product" SET "categoryIds" = ARRAY["categoryId"] WHERE "categoryId" IS NOT NULL AND "categoryIds" = '{}'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "categoryIds"`);
  }
}
