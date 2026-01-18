import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { PortfolioChatService, ChatRequest, ChatMessage } from './portfolio-chat.service';
import { RawPosition } from './portfolio-aggregator.service';

interface ChatRequestDto {
    message: string;
    positions: RawPosition[];
    userName?: string;
    riskProfile?: 'Conservative' | 'Moderate' | 'Aggressive';
    cashBalance?: number;
    conversationHistory?: ChatMessage[];
}

@Controller('portfolio-chat')
export class PortfolioChatController {
    constructor(private readonly chatService: PortfolioChatService) { }

    @Post()
    async chat(@Body() body: ChatRequestDto) {
        try {
            if (!body.message || !body.message.trim()) {
                throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
            }

            if (!body.positions || !Array.isArray(body.positions)) {
                throw new HttpException('Positions array is required', HttpStatus.BAD_REQUEST);
            }

            const response = await this.chatService.chat({
                message: body.message,
                positions: body.positions,
                userName: body.userName,
                riskProfile: body.riskProfile,
                cashBalance: body.cashBalance,
                conversationHistory: body.conversationHistory || []
            });

            return { response };
        } catch (error: any) {
            console.error('[PortfolioChat] Error:', error.message);
            throw new HttpException(
                error.message || 'Chat failed',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
