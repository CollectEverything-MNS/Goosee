import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderBillingAddress1789400100000 implements MigrationInterface {
  name = 'AddOrderBillingAddress1789400100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" ADD "billingAddress" JSONB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "billingAddress"`);
  }
}
