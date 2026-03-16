import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { MorningBriefService } from './morning-brief.service';

@Controller('morning-brief')
export class MorningBriefController {
    constructor(private readonly morningBriefService: MorningBriefService) {}

    @Get('generate')
    async generateBrief() {
        return this.morningBriefService.generateBrief();
    }

    @Post('schedule')
    async updateSchedule(@Body() scheduleData: { enabled: boolean; time: string; userId?: string }) {
        return this.morningBriefService.updateSchedule(scheduleData);
    }

    @Get('schedule')
    async getSchedule() {
        return this.morningBriefService.getSchedule();
    }
}
