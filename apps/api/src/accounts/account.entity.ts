import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { Position } from '../positions/position.entity';

export enum AccountType {
    PAPER = 'paper',
    LIVE = 'live',
}

@Entity()
export class Account {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.accounts)
    user: User;

    @Column()
    userId: string;

    @Column({ type: 'varchar', default: AccountType.PAPER })
    type: AccountType;

    @Column({ default: 'USD' })
    currency: string;

    @Column('decimal', { precision: 18, scale: 2, default: 0 })
    balance: number;

    @OneToMany(() => Order, (order) => order.account)
    orders: Order[];

    @OneToMany(() => Position, (position) => position.account)
    positions: Position[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
