import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenRouter } from '@openrouter/sdk';

export interface PortfolioPosition {
    symbol: string;
    name: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    assetClass: string;
    positionType?: string;
    pnl: number;
    pnlPercent: number;
    notional: number;
}

export interface PortfolioSummary {
    totalValue: number;
    totalInvested: number;
    totalPnL: number;
    pnlPercent: number;
    positions: PortfolioPosition[];
    byAssetClass: Record<string, { value: number; pnl: number; count: number }>;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

@Injectable()
export class PortfolioChatService {
    private readonly logger = new Logger(PortfolioChatService.name);
    private readonly openrouter: OpenRouter;
    private readonly model: string;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENROUTER_API_KEY', '');
        // Use text-only model for chat (faster and cheaper than vision model)
        this.model = this.configService.get<string>('OPENROUTER_CHAT_MODEL', 'qwen/qwen-2.5-72b-instruct');

        this.openrouter = new OpenRouter({
            apiKey: apiKey,
        });

        this.logger.log(`Portfolio Chat initialized with model: ${this.model}`);
    }

    async chat(
        userMessage: string,
        portfolioData: PortfolioSummary,
        conversationHistory: ChatMessage[] = []
    ): Promise<string> {
        this.logger.log(`Processing chat message: "${userMessage.substring(0, 50)}..."`);

        // Build context from portfolio data
        const portfolioContext = this.buildPortfolioContext(portfolioData);

        const systemPrompt = `You are an expert financial advisor AI assistant specializing in portfolio analysis. You have access to the user's real-time portfolio data below. 

Use this data to answer questions accurately and provide helpful insights. Be conversational, clear, and focus on actionable advice when appropriate.

=== PORTFOLIO DATA ===
${portfolioContext}
=== END PORTFOLIO DATA ===

Guidelines:
- Answer questions based on the actual portfolio data provided
- Provide specific numbers and calculations when asked
- Offer insights on diversification, risk, and performance
- Be helpful but remind users that this is not financial advice
- If asked about data you don't have, say so clearly
- Use currency formatting (e.g., $1,234.56) for money values
- Use percentage formatting (e.g., +15.5% or -3.2%) for changes
- Keep responses concise but informative`;

        try {
            const messages: any[] = [
                { role: 'system', content: systemPrompt },
            ];

            // Add conversation history
            for (const msg of conversationHistory.slice(-10)) { // Last 10 messages for context
                messages.push({
                    role: msg.role,
                    content: msg.content,
                });
            }

            // Add current user message
            messages.push({
                role: 'user',
                content: userMessage,
            });

            const response = await this.openrouter.chat.send({
                model: this.model,
                messages,
                maxTokens: 1000,
                temperature: 0.7,
            });

            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from AI model');
            }

            const responseText = typeof content === 'string' ? content : JSON.stringify(content);
            this.logger.log(`Chat response generated (${responseText.length} chars)`);

            return responseText;
        } catch (error: any) {
            this.logger.error(`Chat failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    private buildPortfolioContext(data: PortfolioSummary): string {
        const lines: string[] = [];

        // Helper function for safe number formatting
        const formatCurrency = (value: number): string => {
            if (value === undefined || value === null || isNaN(value)) return '$0.00';
            return '$' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        };

        const formatPercent = (value: number): string => {
            if (value === undefined || value === null || isNaN(value)) return '0.00%';
            return (value >= 0 ? '+' : '') + value.toFixed(2) + '%';
        };

        // Log incoming data for debugging
        this.logger.log(`Building context for ${data.positions?.length || 0} positions`);
        this.logger.log(`Total Value: ${data.totalValue}, Total Invested: ${data.totalInvested}, Total P&L: ${data.totalPnL}`);

        // Summary section
        lines.push('📊 PORTFOLIO SUMMARY');
        lines.push(`Total Portfolio Value: ${formatCurrency(data.totalValue)}`);
        lines.push(`Total Invested: ${formatCurrency(data.totalInvested)}`);
        lines.push(`Total P&L: ${formatCurrency(data.totalPnL)} (${formatPercent(data.pnlPercent)})`);
        lines.push(`Number of Positions: ${data.positions?.length || 0}`);
        lines.push('');

        // Asset class breakdown
        lines.push('📈 BY ASSET CLASS');
        if (data.byAssetClass) {
            for (const [assetClass, info] of Object.entries(data.byAssetClass)) {
                lines.push(`- ${assetClass}: ${formatCurrency(info.value)} | P&L: ${formatCurrency(info.pnl)} | ${info.count} position(s)`);
            }
        }
        lines.push('');

        // Individual positions
        lines.push('📋 POSITIONS (All values shown)');
        if (data.positions && Array.isArray(data.positions)) {
            for (const pos of data.positions) {
                this.logger.debug(`Position ${pos.symbol}: qty=${pos.quantity}, entry=${pos.avgPrice}, current=${pos.currentPrice}, notional=${pos.notional}, pnl=${pos.pnl}`);
                lines.push(`- ${pos.symbol} (${pos.name || pos.symbol})`);
                lines.push(`  Asset Class: ${pos.assetClass || 'Unknown'} | Type: ${pos.positionType || 'Long'}`);
                lines.push(`  Quantity: ${pos.quantity || 0}`);
                lines.push(`  Entry Price: ${formatCurrency(pos.avgPrice)}`);
                lines.push(`  Current Price: ${formatCurrency(pos.currentPrice)}`);
                lines.push(`  Notional Value: ${formatCurrency(pos.notional)}`);
                lines.push(`  P&L: ${formatCurrency(pos.pnl)} (${formatPercent(pos.pnlPercent)})`);
            }
        }

        const context = lines.join('\n');
        this.logger.log(`Portfolio context built (${context.length} chars)`);
        return context;
    }
}
