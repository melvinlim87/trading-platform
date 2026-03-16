import { Controller, Post, Body, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { PortfolioAnalystService, AnalysisPosition, PortfolioAnalysisReport } from './portfolio-analyst.service';

class AnalyzePortfolioDto {
    positions: AnalysisPosition[];
}

@Controller('portfolio-analyst')
export class PortfolioAnalystController {
    constructor(private readonly analystService: PortfolioAnalystService) { }

    @Post('analyze')
    async analyzePortfolio(@Body() dto: AnalyzePortfolioDto): Promise<PortfolioAnalysisReport> {
        if (!dto.positions || !Array.isArray(dto.positions) || dto.positions.length === 0) {
            throw new BadRequestException('positions array is required and must not be empty');
        }
        try {
            return await this.analystService.analyzePortfolio(dto.positions);
        } catch (error: any) {
            throw new HttpException(
                error.message || 'Analysis failed',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
