import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenRouter } from '@openrouter/sdk';

export interface ExtractedPosition {
    symbol: string;
    quantity: number;
    avgPrice: number;
    currentPrice?: number;
    pnl?: number;
}

// Account-level info extracted from screenshots
export interface ExtractedAccountInfo {
    brokerName?: string;        // e.g., "Binance", "IBKR"
    platform?: string;          // e.g., "MT5", "TradingView"
    totalBalance?: number;      // Total account equity
    availableBalance?: number;  // Free margin / available cash
    currency?: string;          // USD, USDT, etc.
}

export interface ExtractionResult {
    positions: ExtractedPosition[];
    accountInfo?: ExtractedAccountInfo;  // Account-level data if visible
    rawResponse?: string;
}

@Injectable()
export class OpenRouterService {
    private readonly logger = new Logger(OpenRouterService.name);
    private readonly openrouter: OpenRouter;
    private readonly model: string;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENROUTER_API_KEY', '');
        this.model = this.configService.get<string>('OPENROUTER_MODEL', 'qwen/qwen2.5-vl-32b-instruct');

        this.openrouter = new OpenRouter({
            apiKey: apiKey,
        });

        this.logger.log(`Initialized with model: ${this.model}`);
        this.logger.log(`API Key configured: ${apiKey ? 'YES (' + apiKey.substring(0, 15) + '...)' : 'NO'}`);
    }

    async extractPortfolioFromImage(base64Image: string): Promise<ExtractionResult> {
        if (!this.openrouter) {
            this.logger.error('OpenRouter client not initialized!');
            throw new HttpException('OpenRouter not configured', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        this.logger.log('Processing image for extraction...');

        const prompt = `You are a financial data extraction assistant. Analyze this portfolio screenshot and extract all position data AND account-level information.

Return ONLY a valid JSON object with this exact structure:
{
  "accountInfo": {
    "brokerName": "BROKER_NAME_IF_VISIBLE",
    "platform": "PLATFORM_IF_VISIBLE",
    "totalBalance": TOTAL_ACCOUNT_EQUITY_IF_VISIBLE,
    "availableBalance": AVAILABLE_CASH_OR_FREE_MARGIN_IF_VISIBLE,
    "currency": "USD_OR_OTHER_CURRENCY"
  },
  "positions": [
    {
      "symbol": "TICKER_SYMBOL",
      "quantity": NUMBER_OF_SHARES_OR_LOTS,
      "avgPrice": AVERAGE_PRICE_PER_SHARE,
      "currentPrice": CURRENT_PRICE_IF_VISIBLE,
      "pnl": PROFIT_OR_LOSS_IF_VISIBLE
    }
  ]
}

Rules:
- Look for account equity, total balance, or account value in headers/summaries
- Look for available balance, free margin, or cash balance  
- Identify broker name from logos or headers (Binance, IBKR, OANDA, etc.)
- Extract ALL visible positions
- Use standard ticker symbols (e.g., AAPL, TSLA, EURUSD, BTCUSD)
- For forex, quantity should be lot size (e.g., 0.1, 1.0)
- Numbers should be plain numbers without currency symbols
- If a value is not visible, omit that field
- Return ONLY the JSON, no explanations`;

        try {
            // Detect image type from base64 header or default to jpeg
            let mimeType = 'image/jpeg';
            if (base64Image.startsWith('/9j/')) {
                mimeType = 'image/jpeg';
            } else if (base64Image.startsWith('iVBORw0KGgo')) {
                mimeType = 'image/png';
            } else if (base64Image.startsWith('R0lGOD')) {
                mimeType = 'image/gif';
            } else if (base64Image.startsWith('UklGR')) {
                mimeType = 'image/webp';
            }

            const dataUrl = `data:${mimeType};base64,${base64Image}`;
            this.logger.log(`Image type detected: ${mimeType}, size: ${Math.round(base64Image.length / 1024)}KB`);

            const response = await this.openrouter.chat.send({
                model: this.model,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            {
                                type: 'image_url',
                                imageUrl: { url: dataUrl },
                            },
                        ],
                    },
                ],
                maxTokens: 2000,
                temperature: 0.1,
            });

            this.logger.log(`Response received from OpenRouter`);

            const rawContent = response.choices[0]?.message?.content;
            if (!rawContent) {
                throw new Error('No response from AI model');
            }

            // Ensure content is a string
            const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

            this.logger.log(`AI Response: ${content.substring(0, 200)}...`);

            // Parse JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Could not extract JSON from response');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            // Validate structure
            if (!parsed.positions || !Array.isArray(parsed.positions)) {
                throw new Error('Invalid response structure');
            }

            this.logger.log(`Extracted ${parsed.positions.length} positions${parsed.accountInfo ? ', plus account info' : ''}`);

            return {
                positions: parsed.positions.map((p: any) => ({
                    symbol: String(p.symbol || '').toUpperCase(),
                    quantity: Number(p.quantity) || 0,
                    avgPrice: Number(p.avgPrice) || 0,
                    currentPrice: p.currentPrice ? Number(p.currentPrice) : undefined,
                    pnl: p.pnl ? Number(p.pnl) : undefined,
                })),
                accountInfo: parsed.accountInfo ? {
                    brokerName: parsed.accountInfo.brokerName,
                    platform: parsed.accountInfo.platform,
                    totalBalance: parsed.accountInfo.totalBalance ? Number(parsed.accountInfo.totalBalance) : undefined,
                    availableBalance: parsed.accountInfo.availableBalance ? Number(parsed.accountInfo.availableBalance) : undefined,
                    currency: parsed.accountInfo.currency || 'USD',
                } : undefined,
                rawResponse: content,
            };
        } catch (error: any) {
            this.logger.error(`Extraction failed: ${error.message}`, error.stack);

            // Check for specific error types
            if (error.status) {
                throw new HttpException(
                    `OpenRouter API error: ${error.message}`,
                    error.status
                );
            }

            throw new HttpException(
                error.message || 'Unknown error during extraction',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
