import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixProductTagUuidColumns1782200000000 implements MigrationInterface {
  name = 'FixProductTagUuidColumns1782200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product_tag"
        ALTER COLUMN "productId" TYPE uuid USING "productId"::uuid,
        ALTER COLUMN "tagId" TYPE uuid USING "tagId"::uuid
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product_tag"
        ALTER COLUMN "productId" TYPE character varying USING "productId"::text,
        ALTER COLUMN "tagId" TYPE character varying USING "tagId"::text
    `);
  }
}
