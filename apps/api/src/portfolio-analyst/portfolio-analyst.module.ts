import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PortfolioAnalystController } from './portfolio-analyst.controller';
import { PortfolioAnalystService } from './portfolio-analyst.service';

@Module({
    imports: [ConfigModule],
    controllers: [PortfolioAnalystController],
    providers: [PortfolioAnalystService],
    exports: [PortfolioAnalystService],
})
export class PortfolioAnalystModule { }
