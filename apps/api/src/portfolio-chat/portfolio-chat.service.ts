import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenRouter } from '@openrouter/sdk';
import { PortfolioAggregatorService, PortfolioContextObject, RawPosition } from './portfolio-aggregator.service';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatRequest {
    message: string;
    positions: RawPosition[];
    userName?: string;
    riskProfile?: 'Conservative' | 'Moderate' | 'Aggressive';
    cashBalance?: number;
    conversationHistory?: ChatMessage[];
}

/**
 * The Mentor Persona System Prompt
 * Following CTO Architecture: Structured instructions for reading the JSON context
 */
const MENTOR_SYSTEM_PROMPT = `You are an AI Portfolio Manager for Decyphers Trading Platform.

## YOUR DATA SOURCE
You have access to a real-time summary of the user's finances in the [PORTFOLIO_CONTEXT] JSON block below. This data is computed in real-time from their actual positions.

## YOUR INSTRUCTIONS

### 1. Answer Specifically
- If the user asks "Why am I down?", look at \`performance.daily_pnl_pct\` and \`drivers.biggest_loser\`. Explain that specific asset is the cause.
- If they ask about their best position, cite \`drivers.biggest_winner\` with the exact P&L numbers.
- Always reference the ACTUAL numbers from the context.

### 2. Check Liquidity
- If the user asks "Can I buy X?", check \`meta.cash_balance\`. 
- If cash is low ($0-$100), advise them they need to deposit or sell something first.
- Mention their current allocation to help them understand their exposure.

### 3. Monitor Risk
- If \`performance.status\` is 'IN DRAWDOWN', be empathetic. Remind them of their \`meta.risk_profile\`.
- If there are items in \`warnings\` array, proactively mention them.
- For Conservative profiles, emphasize capital preservation over gains.

### 4. Explain Allocation
- When asked about diversification, reference the \`allocation\` object.
- If any asset class exceeds 50%, point out the concentration.

### 5. Tone
- Professional, Analytical, yet Supportive
- If they're losing money, be encouraging - remind them it's part of trading
- Celebrate their wins enthusiastically when they ask

### 6. Formatting
- Use $ symbols for money: $1,234.56
- Use % for percentages: +15.5% or -3.2%
- Use emojis sparingly for emphasis: 📈 for gains, 📉 for losses, ⚠️ for warnings

## DISCLAIMER
End every response with a brief reminder that you are an AI assistant and this is not financial advice.`;

@Injectable()
export class PortfolioChatService {
    private readonly logger = new Logger(PortfolioChatService.name);
    private readonly openrouter: OpenRouter;
    private readonly model: string;

    constructor(
        private configService: ConfigService,
        private aggregator: PortfolioAggregatorService
    ) {
        const apiKey = this.configService.get<string>('OPENROUTER_API_KEY', '');
        this.model = this.configService.get<string>('OPENROUTER_CHAT_MODEL', 'qwen/qwen-2.5-72b-instruct');

        this.openrouter = new OpenRouter({
            apiKey: apiKey,
        });

        this.logger.log(`Portfolio Chat initialized with model: ${this.model}`);
    }

    async chat(request: ChatRequest): Promise<string> {
        this.logger.log(`Processing chat: "${request.message.substring(0, 50)}..."`);

        // 1. Run the Aggregator (Fast TypeScript Math)
        const portfolioContext = this.aggregator.getContext(
            request.positions,
            request.userName || 'Trader',
            request.riskProfile || 'Moderate',
            request.cashBalance || 0
        );

        // 2. Format Context as String for the LLM
        const contextJson = JSON.stringify(portfolioContext, null, 2);

        // 3. Build the full system prompt with injected context
        const fullSystemPrompt = `${MENTOR_SYSTEM_PROMPT}

[PORTFOLIO_CONTEXT]
${contextJson}
[/PORTFOLIO_CONTEXT]`;

        this.logger.log(`Context injected: ${Object.keys(portfolioContext.allocation).length} asset classes, status=${portfolioContext.performance.status}`);

        try {
            const messages: any[] = [
                { role: 'system', content: fullSystemPrompt },
            ];

            // Add conversation history (last 10 messages)
            const history = request.conversationHistory || [];
            for (const msg of history.slice(-10)) {
                messages.push({
                    role: msg.role,
                    content: msg.content,
                });
            }

            // Add current user message
            messages.push({
                role: 'user',
                content: request.message,
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
}
