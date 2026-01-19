import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PortfolioImport, ImportStatus } from './portfolio-import.entity';
import { OpenRouterService, ExtractedPosition } from './openrouter.service';
import { Position, VerificationSource } from '../positions/position.entity';
import { Account } from '../accounts/account.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PortfolioImportService {
    constructor(
        @InjectRepository(PortfolioImport)
        private importRepo: Repository<PortfolioImport>,
        @InjectRepository(Position)
        private positionRepo: Repository<Position>,
        @InjectRepository(Account)
        private accountRepo: Repository<Account>,
        private openRouterService: OpenRouterService,
        private dataSource: DataSource,
    ) { }

    async uploadAndExtract(
        accountId: string,
        file: Express.Multer.File,
    ): Promise<PortfolioImport> {
        console.log(`[PortfolioImport] Starting upload for account: ${accountId}`);
        console.log(`[PortfolioImport] File info: ${file?.originalname}, size: ${file?.size}, mimetype: ${file?.mimetype}`);

        // Allow demo-account for testing, otherwise verify account exists
        const isDemo = accountId === 'demo-account';
        if (!isDemo) {
            const account = await this.accountRepo.findOne({ where: { id: accountId } });
            if (!account) {
                throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
            }
        }
        console.log(`[PortfolioImport] Account check passed (demo: ${isDemo})`);

        // Save file
        const uploadDir = path.join(process.cwd(), 'uploads', 'portfolio-imports');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `${accountId}-${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
        console.log(`[PortfolioImport] File saved to: ${filePath}`);

        // Create import record - use undefined accountId for demo mode to avoid FK constraint
        const importRecord = this.importRepo.create({
            accountId: isDemo ? undefined : accountId,
            imagePath: filePath,
            status: ImportStatus.PENDING,
        });
        await this.importRepo.save(importRecord);
        console.log(`[PortfolioImport] Import record created with ID: ${importRecord.id}`);

        try {
            // Extract data using AI
            console.log(`[PortfolioImport] Starting AI extraction...`);
            const base64Image = file.buffer.toString('base64');
            console.log(`[PortfolioImport] Base64 size: ${Math.round(base64Image.length / 1024)}KB`);

            const result = await this.openRouterService.extractPortfolioFromImage(base64Image);
            console.log(`[PortfolioImport] Extraction successful, positions: ${result.positions.length}`);

            // Update record with extracted data
            importRecord.extractedData = { positions: result.positions };
            importRecord.status = ImportStatus.EXTRACTED;
            await this.importRepo.save(importRecord);
            console.log(`[PortfolioImport] Record updated with extracted data`);

            return importRecord;
        } catch (error) {
            console.error(`[PortfolioImport] Extraction failed:`, error.message, error.stack);
            importRecord.status = ImportStatus.FAILED;
            importRecord.errorMessage = error.message;
            await this.importRepo.save(importRecord);
            throw error;
        }
    }

    async getImport(importId: string): Promise<PortfolioImport> {
        const record = await this.importRepo.findOne({ where: { id: importId } });
        if (!record) {
            throw new HttpException('Import not found', HttpStatus.NOT_FOUND);
        }
        return record;
    }

    async updateExtractedData(
        importId: string,
        positions: ExtractedPosition[],
    ): Promise<PortfolioImport> {
        const record = await this.getImport(importId);

        if (record.status === ImportStatus.CONFIRMED) {
            throw new HttpException('Import already confirmed', HttpStatus.BAD_REQUEST);
        }

        record.extractedData = { positions };
        await this.importRepo.save(record);
        return record;
    }

    async confirmImport(importId: string): Promise<{ import: PortfolioImport; positionsCreated: number }> {
        const record = await this.getImport(importId);

        if (record.status === ImportStatus.CONFIRMED) {
            throw new HttpException('Import already confirmed', HttpStatus.BAD_REQUEST);
        }

        if (!record.extractedData?.positions?.length) {
            throw new HttpException('No positions to import', HttpStatus.BAD_REQUEST);
        }

        // Demo mode (null accountId) - skip Position entity creation
        // The frontend will use extractedData directly
        if (!record.accountId) {
            record.status = ImportStatus.CONFIRMED;
            await this.importRepo.save(record);
            return { import: record, positionsCreated: record.extractedData.positions.length };
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let positionsCreated = 0;
            const verifiedAt = new Date();

            for (const pos of record.extractedData.positions) {
                // Check if position already exists
                let existing = await queryRunner.manager.findOne(Position, {
                    where: { accountId: record.accountId, symbol: pos.symbol },
                });

                if (existing) {
                    // Update existing position (average the prices)
                    const totalQty = existing.quantity + pos.quantity;
                    const totalCost = (existing.quantity * existing.avgPrice) + (pos.quantity * pos.avgPrice);
                    existing.quantity = totalQty;
                    existing.avgPrice = totalCost / totalQty;
                    // Update verification status to AI since we're importing from screenshot
                    existing.verificationSource = VerificationSource.AI_IMPORT;
                    existing.importId = importId;
                    existing.verificationConfidence = 0.95; // High confidence for AI extraction
                    existing.verifiedAt = verifiedAt;
                    await queryRunner.manager.save(Position, existing);
                } else {
                    // Create new position with AI verification
                    const newPosition = queryRunner.manager.create(Position, {
                        accountId: record.accountId,
                        symbol: pos.symbol,
                        quantity: pos.quantity,
                        avgPrice: pos.avgPrice,
                        verificationSource: VerificationSource.AI_IMPORT,
                        importId: importId,
                        verificationConfidence: 0.95,
                        verifiedAt: verifiedAt,
                    });
                    await queryRunner.manager.save(Position, newPosition);
                    positionsCreated++;
                }
            }

            record.status = ImportStatus.CONFIRMED;
            await queryRunner.manager.save(PortfolioImport, record);

            await queryRunner.commitTransaction();

            return { import: record, positionsCreated };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new HttpException(
                `Failed to confirm import: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        } finally {
            await queryRunner.release();
        }
    }

    async getImportHistory(accountId: string): Promise<PortfolioImport[]> {
        return this.importRepo.find({
            where: { accountId },
            order: { createdAt: 'DESC' },
            take: 10,
        });
    }
}
