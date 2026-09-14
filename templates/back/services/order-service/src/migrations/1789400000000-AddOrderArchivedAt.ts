import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderArchivedAt1789400000000 implements MigrationInterface {
  name = 'AddOrderArchivedAt1789400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" ADD "archivedAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "archivedAt"`);
  }
}
