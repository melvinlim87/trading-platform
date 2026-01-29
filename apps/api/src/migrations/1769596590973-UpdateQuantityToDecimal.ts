import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateQuantityToDecimal1769596590973 implements MigrationInterface {
    name = 'UpdateQuantityToDecimal1769596590973'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "position" ALTER COLUMN "quantity" TYPE numeric(18,8) USING "quantity"::numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "position" ALTER COLUMN "quantity" TYPE integer USING "quantity"::integer`);
    }

}
