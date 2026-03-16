import { Module } from '@nestjs/common';
import { MorningBriefController } from './morning-brief.controller';
import { MorningBriefService } from './morning-brief.service';

@Module({
    controllers: [MorningBriefController],
    providers: [MorningBriefService],
    exports: [MorningBriefService],
})
export class MorningBriefModule {}
