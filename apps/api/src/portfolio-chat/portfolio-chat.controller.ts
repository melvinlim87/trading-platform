import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { PortfolioChatService, PortfolioSummary, ChatMessage } from './portfolio-chat.service';

interface ChatRequestDto {
    message: string;
    portfolioData: PortfolioSummary;
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

            if (!body.portfolioData) {
                throw new HttpException('Portfolio data is required', HttpStatus.BAD_REQUEST);
            }

            const response = await this.chatService.chat(
                body.message,
                body.portfolioData,
                body.conversationHistory || []
            );

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
