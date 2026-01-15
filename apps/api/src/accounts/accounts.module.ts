import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { Account } from './account.entity';
import { Position } from '../positions/position.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Account, Position])],
    providers: [AccountsService],
    controllers: [AccountsController],
    exports: [AccountsService],
})
export class AccountsModule { }
