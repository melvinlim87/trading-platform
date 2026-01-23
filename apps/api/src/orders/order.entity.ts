import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    DeleteDateColumn
} from 'typeorm';
import { Account } from '../accounts/account.entity';

export enum OrderSide {
    BUY = 'buy',
    SELL = 'sell',
}

export enum OrderType {
    MARKET = 'market',
    LIMIT = 'limit',
}

export enum OrderStatus {
    PENDING = 'pending',
    FILLED = 'filled',
    CANCELLED = 'cancelled',
    REJECTED = 'rejected',
}

export enum OrderTimeInForce {
    GTC = 'GTC', // Good Till Cancelled
    IOC = 'IOC', // Immediate or Cancel
    FOK = 'FOK', // Fill or Kill
}

@Entity()
@Index(['symbol'])
@Index(['status'])
@Index(['createdAt'])
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Account, (account) => account.orders)
    account: Account;

    @Column()
    accountId: string;

    @Column()
    symbol: string;

    @Column({ type: 'varchar' })
    side: OrderSide;

    @Column({ type: 'varchar' })
    type: OrderType;

    @Column({ type: 'varchar', default: OrderTimeInForce.GTC })
    timeInForce: OrderTimeInForce;

    @Column('int')
    quantity: number;

    @Column('int', { default: 0 })
    filledQuantity: number;

    @Column('decimal', { precision: 18, scale: 2, nullable: true })
    price: number; // Limit price, null for market

    @Column('decimal', { precision: 18, scale: 2, nullable: true })
    stopPrice: number; // Stop price for Stop-Loss/Take-Profit

    @Column({ type: 'varchar', default: OrderStatus.PENDING })
    status: OrderStatus;

    @Column('decimal', { precision: 18, scale: 2, nullable: true })
    filledPrice: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
