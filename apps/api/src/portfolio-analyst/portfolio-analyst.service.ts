import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenRouter } from '@openrouter/sdk';

// Input position format
export interface AnalysisPosition {
    symbol: string;
    name: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    assetClass: string;
    leverage?: number;
    broker?: string;
    pnl?: number;
    pnlPercent?: number;
}

// Risk alert structure
export interface RiskAlert {
    symbol: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    reason: string;
    suggestion?: string;
}

// News alert structure
export interface NewsAlert {
    symbol: string;
    headline: string;
    impact: 'low' | 'medium' | 'high';
    timeframe?: string;
}

// Overtrading warning
export interface OvertradingWarning {
    symbol?: string;
    warning: string;
    suggestion: string;
}

// Full analysis report
export interface PortfolioAnalysisReport {
    overallScore: number;
    scoreLabel: 'Poor' | 'Fair' | 'Good' | 'Excellent';
    riskAlerts: RiskAlert[];
    newsAlerts: NewsAlert[];
    overtradingWarnings: OvertradingWarning[];
    recommendations: string[];
    summary: string;
    generatedAt: string;
}

@Injectable()
export class PortfolioAnalystService {
    private readonly logger = new Logger(PortfolioAnalystService.name);
    private readonly openrouter: OpenRouter;
    private readonly model: string;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENROUTER_API_KEY', '');
        this.model = this.configService.get<string>('OPENROUTER_MODEL', 'qwen/qwen2.5-vl-32b-instruct');

        this.openrouter = new OpenRouter({
            apiKey: apiKey,
        });

        this.logger.log(`Portfolio Analyst initialized with model: ${this.model}`);
    }

    async analyzePortfolio(positions: AnalysisPosition[]): Promise<PortfolioAnalysisReport> {
        this.logger.log(`Analyzing portfolio with ${positions.length} positions`);

        // Calculate portfolio metrics for context
        const totalValue = positions.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0);
        const totalPnL = positions.reduce((sum, p) => sum + (p.pnl || 0), 0);

        // Calculate asset class allocation
        const allocation: Record<string, number> = {};
        positions.forEach(p => {
            const value = p.currentPrice * p.quantity;
            allocation[p.assetClass] = (allocation[p.assetClass] || 0) + value;
        });

        // Convert to percentages
        const allocationPct: Record<string, string> = {};
        Object.entries(allocation).forEach(([key, val]) => {
            allocationPct[key] = ((val / totalValue) * 100).toFixed(1) + '%';
        });

        const prompt = `You are an expert AI Portfolio Analyst. Analyze the following portfolio and provide a comprehensive risk assessment.

## PORTFOLIO DATA
Total Value: $${totalValue.toLocaleString()}
Total P&L: $${totalPnL.toLocaleString()}
Asset Allocation: ${JSON.stringify(allocationPct)}

## POSITIONS
${JSON.stringify(positions, null, 2)}

## ANALYSIS REQUIRED

Provide a JSON response with this EXACT structure:
{
  "overallScore": <number 0-100>,
  "scoreLabel": "<Poor|Fair|Good|Excellent>",
  "riskAlerts": [
    { "symbol": "SYMBOL", "level": "low|medium|high|critical", "reason": "explanation", "suggestion": "what to do" }
  ],
  "newsAlerts": [
    { "symbol": "SYMBOL", "headline": "Key event to watch", "impact": "low|medium|high", "timeframe": "when" }
  ],
  "overtradingWarnings": [
    { "symbol": "SYMBOL or null", "warning": "issue description", "suggestion": "recommendation" }
  ],
  "recommendations": [
    "actionable advice 1",
    "actionable advice 2"
  ],
  "summary": "2-3 sentence overall portfolio health summary"
}

## SCORING GUIDE
- 90-100 Excellent: Well diversified, low risk, good performance
- 70-89 Good: Minor concentration or risk issues
- 50-69 Fair: Notable risks or imbalances
- 0-49 Poor: High risk, needs immediate attention

## ANALYSIS FOCUS
1. **Concentration Risk**: Flag if any single position > 25% of portfolio
2. **Leverage Risk**: Flag leveraged positions, especially > 10x
3. **Asset Class Balance**: Note over/under exposure
4. **Correlation Risk**: Similar assets moving together
5. **P&L Analysis**: Identify major winners/losers
6. **News Sensitivity**: What macro events affect these holdings

Return ONLY valid JSON, no explanations.`;

        try {
            const response = await this.openrouter.chat.send({
                model: this.model,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                maxTokens: 2000,
                temperature: 0.3,
            });

            const rawContent = response.choices[0]?.message?.content;
            if (!rawContent) {
                throw new Error('No response from AI model');
            }

            const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
            this.logger.log(`Analysis response received (${content.length} chars)`);

            // Parse JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Could not extract JSON from response');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            // Validate and return
            const report: PortfolioAnalysisReport = {
                overallScore: Number(parsed.overallScore) || 50,
                scoreLabel: parsed.scoreLabel || 'Fair',
                riskAlerts: Array.isArray(parsed.riskAlerts) ? parsed.riskAlerts : [],
                newsAlerts: Array.isArray(parsed.newsAlerts) ? parsed.newsAlerts : [],
                overtradingWarnings: Array.isArray(parsed.overtradingWarnings) ? parsed.overtradingWarnings : [],
                recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
                summary: parsed.summary || 'Analysis complete.',
                generatedAt: new Date().toISOString(),
            };

            this.logger.log(`Analysis complete: Score ${report.overallScore} (${report.scoreLabel})`);
            return report;

        } catch (error: any) {
            this.logger.error(`Analysis failed: ${error.message}`, error.stack);

            // Return a fallback report on error
            return {
                overallScore: 0,
                scoreLabel: 'Poor',
                riskAlerts: [{ symbol: 'SYSTEM', level: 'critical', reason: 'Analysis failed: ' + error.message }],
                newsAlerts: [],
                overtradingWarnings: [],
                recommendations: ['Please try again later'],
                summary: 'Unable to complete analysis due to an error.',
                generatedAt: new Date().toISOString(),
            };
        }
    }
}
