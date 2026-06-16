import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1781634830540 implements MigrationInterface {
    name = 'Init1781634830540'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."log_level_enum" AS ENUM('INFO', 'SUCCESS', 'ERROR', 'WARNING', 'CRITICAL', 'DEBUG')`);
        await queryRunner.query(`CREATE TABLE "log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service" character varying, "level" "public"."log_level_enum", "message" text NOT NULL, "userId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_350604cbdf991d5930d9e618fbd" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "log"`);
        await queryRunner.query(`DROP TYPE "public"."log_level_enum"`);
    }

}
