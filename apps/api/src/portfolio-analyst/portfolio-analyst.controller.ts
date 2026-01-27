import { Controller, Post, Body } from '@nestjs/common';
import { PortfolioAnalystService, AnalysisPosition, PortfolioAnalysisReport } from './portfolio-analyst.service';

class AnalyzePortfolioDto {
    positions: AnalysisPosition[];
}

@Controller('portfolio-analyst')
export class PortfolioAnalystController {
    constructor(private readonly analystService: PortfolioAnalystService) { }

    @Post('analyze')
    async analyzePortfolio(@Body() dto: AnalyzePortfolioDto): Promise<PortfolioAnalysisReport> {
        return this.analystService.analyzePortfolio(dto.positions);
    }
}
