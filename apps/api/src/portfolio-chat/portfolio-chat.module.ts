import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PortfolioChatController } from './portfolio-chat.controller';
import { PortfolioChatService } from './portfolio-chat.service';
import { PortfolioAggregatorService } from './portfolio-aggregator.service';

@Module({
    imports: [ConfigModule],
    controllers: [PortfolioChatController],
    providers: [PortfolioChatService, PortfolioAggregatorService],
    exports: [PortfolioChatService, PortfolioAggregatorService],
})
export class PortfolioChatModule { }
