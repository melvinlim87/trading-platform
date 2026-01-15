import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './order.entity';
import { AccountsModule } from '../accounts/accounts.module';
import { MarketDataModule } from '../market-data/market-data.module';
import { Position } from '../positions/position.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, Position]),
        AccountsModule,
        MarketDataModule,
    ],
    providers: [OrdersService],
    controllers: [OrdersController],
})
export class OrdersModule { }
