import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePositionTable1769592721448 implements MigrationInterface {
    name = 'UpdatePositionTable1769592721448'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "position" ADD "assetClass" character varying`);
        await queryRunner.query(`ALTER TABLE "position" ADD "positionType" character varying`);
        await queryRunner.query(`ALTER TABLE "position" ADD "broker" character varying`);
        await queryRunner.query(`ALTER TABLE "position" ADD "platform" character varying`);
        await queryRunner.query(`ALTER TABLE "position" ADD "expiry" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "position" DROP COLUMN "expiry"`);
        await queryRunner.query(`ALTER TABLE "position" DROP COLUMN "platform"`);
        await queryRunner.query(`ALTER TABLE "position" DROP COLUMN "broker"`);
        await queryRunner.query(`ALTER TABLE "position" DROP COLUMN "positionType"`);
        await queryRunner.query(`ALTER TABLE "position" DROP COLUMN "assetClass"`);
    }

}
