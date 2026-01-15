import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Account } from '../accounts/account.entity';

export enum ImportStatus {
  PENDING = 'pending',
  EXTRACTED = 'extracted',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

@Entity()
export class PortfolioImport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, { nullable: true })
  account: Account;

  @Column({ nullable: true })
  accountId: string;

  @Column({ nullable: true })
  imagePath: string;

  @Column('simple-json', { nullable: true })
  extractedData: {
    positions: Array<{
      symbol: string;
      quantity: number;
      avgPrice: number;
      currentPrice?: number;
      pnl?: number;
    }>;
  };

  @Column({
    type: 'varchar',
    default: ImportStatus.PENDING,
  })
  status: ImportStatus;

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
