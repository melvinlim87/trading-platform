import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountType } from './account.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AccountsService {
    constructor(
        @InjectRepository(Account)
        private accountsRepository: Repository<Account>,
    ) { }

    async createPaperAccount(user: User): Promise<Account> {
        const account = this.accountsRepository.create({
            user,
            type: AccountType.PAPER,
            balance: 100000, // $100k paper money
            currency: 'USD',
        });
        return this.accountsRepository.save(account);
    }

    async findByUserId(userId: string): Promise<Account[]> {
        return this.accountsRepository.find({
            where: { userId },
            relations: ['positions'],
        });
    }

    async findOne(id: string): Promise<Account | null> {
        return this.accountsRepository.findOne({
            where: { id },
            relations: ['positions'],
        });
    }
}
