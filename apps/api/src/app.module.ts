import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/user.entity';
import { Account } from './accounts/account.entity';
import { Order } from './orders/order.entity';
import { Position } from './positions/position.entity';
import { PortfolioImport } from './portfolio-import/portfolio-import.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { OrdersModule } from './orders/orders.module';
import { MarketDataModule } from './market-data/market-data.module';
import { PortfolioImportModule } from './portfolio-import/portfolio-import.module';
import { PortfolioChatModule } from './portfolio-chat/portfolio-chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD ?? 'password',
      database: process.env.DB_DATABASE || 'trading_platform',
      entities: [User, Account, Order, Position, PortfolioImport],
      synchronize: false, // We use migrations now
    }),
    UsersModule,
    AuthModule,
    AccountsModule,
    OrdersModule,
    MarketDataModule,
    PortfolioImportModule,
    PortfolioChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
