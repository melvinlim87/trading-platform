import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1769167693686 implements MigrationInterface {
    name = 'InitialSchema1769167693686'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`order\` (\`id\` varchar(36) NOT NULL, \`accountId\` varchar(255) NOT NULL, \`symbol\` varchar(255) NOT NULL, \`side\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`timeInForce\` varchar(255) NOT NULL DEFAULT 'GTC', \`quantity\` int NOT NULL, \`filledQuantity\` int NOT NULL DEFAULT '0', \`price\` decimal(18,2) NULL, \`stopPrice\` decimal(18,2) NULL, \`status\` varchar(255) NOT NULL DEFAULT 'pending', \`filledPrice\` decimal(18,2) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, INDEX \`IDX_7bb07d3c6e225d75d8418380f1\` (\`createdAt\`), INDEX \`IDX_7a9573d6a1fb982772a9123320\` (\`status\`), INDEX \`IDX_9cc9278f1b3135ba5b07cb5e1d\` (\`symbol\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`position\` (\`id\` varchar(36) NOT NULL, \`accountId\` varchar(255) NOT NULL, \`symbol\` varchar(255) NOT NULL, \`quantity\` int NOT NULL, \`avgPrice\` decimal(18,2) NOT NULL, \`verificationSource\` varchar(255) NOT NULL DEFAULT 'manual', \`importId\` varchar(255) NULL, \`verificationConfidence\` float NULL, \`verifiedAt\` timestamp NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`account\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL DEFAULT 'paper', \`currency\` varchar(255) NOT NULL DEFAULT 'USD', \`balance\` decimal(18,2) NOT NULL DEFAULT '0.00', \`lockedBalance\` decimal(18,2) NOT NULL DEFAULT '0.00', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`passwordHash\` varchar(255) NOT NULL, \`role\` varchar(255) NOT NULL DEFAULT 'user', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`portfolio_import\` (\`id\` varchar(36) NOT NULL, \`accountId\` varchar(255) NULL, \`imagePath\` varchar(255) NULL, \`extractedData\` text NULL, \`status\` varchar(255) NOT NULL DEFAULT 'pending', \`errorMessage\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`order\` ADD CONSTRAINT \`FK_8cb9cecbc8b09bf60c71f7a9680\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`position\` ADD CONSTRAINT \`FK_e848b9ce8324419d8219653c551\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`account\` ADD CONSTRAINT \`FK_60328bf27019ff5498c4b977421\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`portfolio_import\` ADD CONSTRAINT \`FK_ef5adcdd9a3c431aaf1221dfa2d\` FOREIGN KEY (\`accountId\`) REFERENCES \`account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`portfolio_import\` DROP FOREIGN KEY \`FK_ef5adcdd9a3c431aaf1221dfa2d\``);
        await queryRunner.query(`ALTER TABLE \`account\` DROP FOREIGN KEY \`FK_60328bf27019ff5498c4b977421\``);
        await queryRunner.query(`ALTER TABLE \`position\` DROP FOREIGN KEY \`FK_e848b9ce8324419d8219653c551\``);
        await queryRunner.query(`ALTER TABLE \`order\` DROP FOREIGN KEY \`FK_8cb9cecbc8b09bf60c71f7a9680\``);
        await queryRunner.query(`DROP TABLE \`portfolio_import\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`account\``);
        await queryRunner.query(`DROP TABLE \`position\``);
        await queryRunner.query(`DROP INDEX \`IDX_9cc9278f1b3135ba5b07cb5e1d\` ON \`order\``);
        await queryRunner.query(`DROP INDEX \`IDX_7a9573d6a1fb982772a9123320\` ON \`order\``);
        await queryRunner.query(`DROP INDEX \`IDX_7bb07d3c6e225d75d8418380f1\` ON \`order\``);
        await queryRunner.query(`DROP TABLE \`order\``);
    }

}
