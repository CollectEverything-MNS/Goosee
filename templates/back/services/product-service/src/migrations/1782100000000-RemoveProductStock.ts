import { MigrationInterface, QueryRunner } from 'typeorm';

// La quantite en stock demenage dans stock-service (voir templates/back/services/stock-service).
// product-service ne garde que `isAvailable` (bascule de visibilite catalogue, independante
// de la quantite).
export class RemoveProductStock1782100000000 implements MigrationInterface {
  name = 'RemoveProductStock1782100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN IF EXISTS "stock"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" ADD COLUMN "stock" integer NOT NULL DEFAULT 0`);
  }
}
