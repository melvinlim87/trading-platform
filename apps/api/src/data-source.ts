import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './users/user.entity';
import { Account } from './accounts/account.entity';
import { Order } from './orders/order.entity';
import { Position } from './positions/position.entity';
import { PortfolioImport } from './portfolio-import/portfolio-import.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_DATABASE || 'trading_platform',
  entities: [User, Account, Order, Position, PortfolioImport],
  synchronize: false,
  migrations: ['dist/migrations/*.js'],
});
