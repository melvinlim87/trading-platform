import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderSide, OrderType, OrderStatus } from './order.entity';
import { AccountsService } from '../accounts/accounts.service';
import { MarketDataService } from '../market-data/market-data.service';
import { Position } from '../positions/position.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(Position)
        private positionsRepository: Repository<Position>,
        private accountsService: AccountsService,
        private marketDataService: MarketDataService,
        private dataSource: DataSource,
    ) { }

    async placeOrder(userId: string, orderDto: any): Promise<Order> {
        const accounts = await this.accountsService.findByUserId(userId);
        const account = accounts.find(a => a.id === orderDto.accountId);

        if (!account) {
            throw new BadRequestException('Account not found');
        }

        // Basic validation
        const currentPrice = this.marketDataService.getPrice(orderDto.symbol);
        const estimatedCost = currentPrice * orderDto.quantity;

        if (orderDto.side === OrderSide.BUY && account.balance < estimatedCost) {
            throw new BadRequestException('Insufficient funds');
        }

        // Transaction for order placement and execution
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const order = this.ordersRepository.create({
                ...orderDto,
                status: OrderStatus.PENDING,
            });

            let savedOrder = (await queryRunner.manager.save(Order, order)) as unknown as Order;

            // Instant execution for Market Orders (Paper Trading)
            if (savedOrder.type === OrderType.MARKET) {
                savedOrder.status = OrderStatus.FILLED;
                savedOrder.filledPrice = currentPrice;

                // Update Account Balance
                if (savedOrder.side === OrderSide.BUY) {
                    account.balance = Number(account.balance) - estimatedCost;
                } else {
                    account.balance = Number(account.balance) + estimatedCost;
                }
                await queryRunner.manager.save(account);

                // Update Position
                let position = await this.positionsRepository.findOne({
                    where: { accountId: account.id, symbol: savedOrder.symbol }
                });

                if (!position) {
                    position = this.positionsRepository.create({
                        accountId: account.id,
                        symbol: savedOrder.symbol,
                        quantity: 0,
                        avgPrice: 0,
                    });
                }

                if (savedOrder.side === OrderSide.BUY) {
                    const totalCost = (Number(position.quantity) * Number(position.avgPrice)) + estimatedCost;
                    position.quantity += savedOrder.quantity;
                    position.avgPrice = totalCost / position.quantity;
                } else {
                    position.quantity -= savedOrder.quantity;
                    // Avg price doesn't change on sell, only Realized P&L (omitted for brevity)
                }

                if (position.quantity === 0) {
                    await queryRunner.manager.remove(position);
                } else {
                    await queryRunner.manager.save(position);
                }

                await queryRunner.manager.save(savedOrder);
            }

            await queryRunner.commitTransaction();
            return savedOrder;

        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async getOrders(accountId: string): Promise<Order[]> {
        return this.ordersRepository.find({ where: { accountId }, order: { createdAt: 'DESC' } });
    }
}
