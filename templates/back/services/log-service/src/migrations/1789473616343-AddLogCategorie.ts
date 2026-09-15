import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLogCategorie1789473616343 implements MigrationInterface {
    name = 'AddLogCategorie1789473616343'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "log" ADD "categorie" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "log" DROP COLUMN "categorie"`);
    }

}
