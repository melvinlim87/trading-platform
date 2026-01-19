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

    @Column('int')
    quantity: number;

    @Column('decimal', { precision: 18, scale: 2 })
    avgPrice: number;

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
