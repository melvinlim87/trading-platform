import {
    Controller,
    Post,
    Put,
    Get,
    Body,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Request,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { PortfolioImportService } from './portfolio-import.service';
import { ExtractedPosition } from './openrouter.service';

@Controller('portfolio-import')
// Auth guard removed for demo - in production, re-enable: @UseGuards(AuthGuard('jwt'))
export class PortfolioImportController {
    constructor(private portfolioImportService: PortfolioImportService) { }

    @Post('upload/:accountId')
    @UseInterceptors(FileInterceptor('image', {
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {
                return cb(new HttpException('Only image files are allowed', HttpStatus.BAD_REQUEST), false);
            }
            cb(null, true);
        },
    }))
    async uploadScreenshot(
        @Param('accountId') accountId: string,
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any,
    ) {
        try {
            if (!file) {
                throw new HttpException('No image file provided', HttpStatus.BAD_REQUEST);
            }
            console.log('[Controller] Processing upload for account:', accountId);
            return await this.portfolioImportService.uploadAndExtract(accountId, file);
        } catch (error: any) {
            console.error('[Controller] Upload error:', error.message, error.stack);
            // Re-throw with full error message for client
            throw new HttpException(
                error.message || 'Unknown error during upload',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get(':importId')
    async getImport(@Param('importId') importId: string) {
        return this.portfolioImportService.getImport(importId);
    }

    @Put(':importId')
    async updateExtractedData(
        @Param('importId') importId: string,
        @Body() body: { positions: ExtractedPosition[] },
    ) {
        return this.portfolioImportService.updateExtractedData(importId, body.positions);
    }

    @Post(':importId/confirm')
    async confirmImport(@Param('importId') importId: string) {
        return this.portfolioImportService.confirmImport(importId);
    }

    @Get('history/:accountId')
    async getHistory(@Param('accountId') accountId: string) {
        return this.portfolioImportService.getImportHistory(accountId);
    }
}
