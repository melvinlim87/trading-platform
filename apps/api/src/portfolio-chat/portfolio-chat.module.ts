import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PortfolioChatController } from './portfolio-chat.controller';
import { PortfolioChatService } from './portfolio-chat.service';

@Module({
    imports: [ConfigModule],
    controllers: [PortfolioChatController],
    providers: [PortfolioChatService],
    exports: [PortfolioChatService],
})
export class PortfolioChatModule { }
