import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Account } from '../accounts/account.entity';

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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
