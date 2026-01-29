import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PositionsService } from './positions.service';

@Controller('positions')
@UseGuards(AuthGuard('jwt'))
export class PositionsController {
    constructor(private readonly positionsService: PositionsService) { }

    @Get()
    async getPositions(@Request() req: any) {
        return this.positionsService.findAllByUserId(req.user.userId);
    }

    @Post()
    async savePosition(@Request() req: any, @Body() positionData: any) {
        return this.positionsService.saveManualPosition(req.user.userId, positionData);
    }
}
