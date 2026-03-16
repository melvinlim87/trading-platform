import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Account } from '../accounts/account.entity';

export enum VerificationSource {
    AI_IMPORT = 'ai_import',
    API_LINKED = 'api_linked',
    MANUAL = 'manual',
}

@Entity()
export class Position {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Account, (account) => account.positions)
    account: Account;

    @Column()
    accountId: string;

    @Column()
    symbol: string;

    @Column({ nullable: true })
    name: string;

    @Column('float', { nullable: true })
    quantity: number;

    @Column('decimal', { precision: 18, scale: 8, nullable: true })
    avgPrice: number;

    @Column({ nullable: true })
    assetClass: string;

    @Column({ nullable: true })
    positionType: string;

    @Column({ nullable: true })
    broker: string;

    @Column({ nullable: true })
    platform: string;

    @Column({ nullable: true })
    expiry: string;

    @Column('float', { nullable: true })
    leverage: number | null;

    @Column('float', { nullable: true })
    lotSize: number | null;

    @Column('float', { nullable: true })
    pipValue: number | null;

    @Column({ type: 'varchar', nullable: true })
    riskOverride: string | null;

    // Verification fields
    @Column({ type: 'varchar', default: VerificationSource.MANUAL })
    verificationSource: VerificationSource;

    @Column({ nullable: true })
    importId: string;  // Links to PortfolioImport record for AI imports

    @Column({ type: 'float', nullable: true })
    verificationConfidence: number;  // AI confidence 0-1

    @Column({ type: 'timestamp', nullable: true })
    verifiedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
