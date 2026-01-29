import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './position.entity';
import { Account } from '../accounts/account.entity';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Position, Account])],
    controllers: [PositionsController],
    providers: [PositionsService],
    exports: [PositionsService],
})
export class PositionsModule { }
