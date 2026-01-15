import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountsService } from './accounts.service';

@Controller('accounts')
@UseGuards(AuthGuard('jwt'))
export class AccountsController {
    constructor(private accountsService: AccountsService) { }

    @Get()
    async getUserAccounts(@Request() req: any) {
        return this.accountsService.findByUserId(req.user.userId);
    }
}
