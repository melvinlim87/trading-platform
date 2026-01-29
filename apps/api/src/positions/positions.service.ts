import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position, VerificationSource } from './position.entity';
import { Account } from '../accounts/account.entity';

@Injectable()
export class PositionsService {
    constructor(
        @InjectRepository(Position)
        private positionsRepository: Repository<Position>,
        @InjectRepository(Account)
        private accountsRepository: Repository<Account>,
    ) { }

    async findAllByUserId(userId: string): Promise<Position[]> {
        return this.positionsRepository.find({
            where: { account: { userId } },
            relations: ['account'],
        });
    }

    async saveManualPosition(userId: string, positionData: any): Promise<Position> {
        // Validation
        if (!positionData.symbol || !positionData.quantity || !positionData.avgPrice) {
            throw new BadRequestException('Missing required fields');
        }

        // Find or create a default paper account if none specified
        let accountId = positionData.accountId;
        if (!accountId) {
            const accounts = await this.accountsRepository.find({
                where: { userId, type: 'paper' as any }
            });
            if (accounts.length === 0) {
                // Auto-create a paper account if it doesn't exist
                const newAccount = this.accountsRepository.create({
                    userId,
                    type: 'paper' as any,
                    balance: 100000,
                    currency: 'USD',
                });
                const savedAccount = await this.accountsRepository.save(newAccount);
                accountId = savedAccount.id;
            } else {
                accountId = accounts[0].id;
            }
        }

        // Check if position already exists for this account and symbol
        let position = await this.positionsRepository.findOne({
            where: { accountId, symbol: positionData.symbol.toUpperCase() }
        });

        if (position) {
            position.quantity = Number(positionData.quantity);
            position.avgPrice = Number(positionData.avgPrice);
            position.assetClass = positionData.assetClass;
            position.positionType = positionData.positionType;
            position.broker = positionData.broker;
            position.platform = positionData.platform;
            position.expiry = positionData.expiry;
        } else {
            position = this.positionsRepository.create({
                accountId,
                symbol: positionData.symbol.toUpperCase(),
                quantity: Number(positionData.quantity),
                avgPrice: Number(positionData.avgPrice),
                assetClass: positionData.assetClass,
                positionType: positionData.positionType,
                broker: positionData.broker,
                platform: positionData.platform,
                expiry: positionData.expiry,
                verificationSource: VerificationSource.MANUAL,
            });
        }

        return this.positionsRepository.save(position);
    }
}
