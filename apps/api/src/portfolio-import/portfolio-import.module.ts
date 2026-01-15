import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { PortfolioImport } from './portfolio-import.entity';
import { PortfolioImportService } from './portfolio-import.service';
import { PortfolioImportController } from './portfolio-import.controller';
import { OpenRouterService } from './openrouter.service';
import { Position } from '../positions/position.entity';
import { Account } from '../accounts/account.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([PortfolioImport, Position, Account]),
        MulterModule.register({
            limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        }),
    ],
    controllers: [PortfolioImportController],
    providers: [PortfolioImportService, OpenRouterService],
    exports: [PortfolioImportService],
})
export class PortfolioImportModule { }
