import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1769508926143 implements MigrationInterface {
    name = 'InitialSchema1769508926143'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "timeInForce" character varying NOT NULL DEFAULT 'GTC'`);
        await queryRunner.query(`ALTER TABLE "order" ADD "filledQuantity" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order" ADD "stopPrice" numeric(18,2)`);
        await queryRunner.query(`ALTER TABLE "order" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "account" ADD "lockedBalance" numeric(18,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "account" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`CREATE INDEX "IDX_7bb07d3c6e225d75d8418380f1" ON "order" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_7a9573d6a1fb982772a9123320" ON "order" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_9cc9278f1b3135ba5b07cb5e1d" ON "order" ("symbol") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_9cc9278f1b3135ba5b07cb5e1d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7a9573d6a1fb982772a9123320"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7bb07d3c6e225d75d8418380f1"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "lockedBalance"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "stopPrice"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "filledQuantity"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "timeInForce"`);
    }

}
