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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const useSqlite = configService.get<string>('USE_SQLITE') === 'true';

        if (useSqlite) {
          return {
            type: 'better-sqlite3',
            database: 'trading_platform.db',
            entities: [User, Account, Order, Position, PortfolioImport],
            synchronize: true,
          };
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', 'postgres'),
          database: configService.get<string>('DB_DATABASE', 'trading_platform'),
          entities: [User, Account, Order, Position, PortfolioImport],
          synchronize: true, // Set to false in production
        };
      },
      inject: [ConfigService],
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
