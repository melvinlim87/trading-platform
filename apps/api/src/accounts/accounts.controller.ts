import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountsService } from './accounts.service';

@Controller('accounts')
export class AccountsController {
    constructor(private accountsService: AccountsService) { }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async getUserAccounts(@Request() req: any) {
        return this.accountsService.findByUserId(req.user.userId);
    }
}
