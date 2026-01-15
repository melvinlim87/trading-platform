import { Controller, Get, Query } from '@nestjs/common';
import { PriceProxyService, PriceData } from './price-proxy.service';

@Controller('prices')
export class PriceProxyController {
    constructor(private readonly priceProxyService: PriceProxyService) { }

    @Get('stocks')
    async getStockPrices(@Query('symbols') symbols: string): Promise<Record<string, PriceData>> {
        if (!symbols) {
            return {};
        }
        const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
        return this.priceProxyService.getStockPrices(symbolList);
    }

    @Get('crypto')
    async getCryptoPrices(@Query('symbols') symbols: string): Promise<Record<string, PriceData>> {
        if (!symbols) {
            return {};
        }
        const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
        return this.priceProxyService.getCryptoPrices(symbolList);
    }

    @Get('forex')
    async getForexPrices(@Query('pairs') pairs: string): Promise<Record<string, PriceData>> {
        if (!pairs) {
            return {};
        }
        const pairList = pairs.split(',').map(s => s.trim().toUpperCase());
        return this.priceProxyService.getForexPrices(pairList);
    }

    @Get('all')
    async getAllPrices(
        @Query('crypto') crypto?: string,
        @Query('stocks') stocks?: string,
        @Query('forex') forex?: string,
    ): Promise<{
        crypto: Record<string, PriceData>;
        stocks: Record<string, PriceData>;
        forex: Record<string, PriceData>;
    }> {
        return this.priceProxyService.getAllPrices({
            crypto: crypto ? crypto.split(',').map(s => s.trim().toUpperCase()) : [],
            stocks: stocks ? stocks.split(',').map(s => s.trim().toUpperCase()) : [],
            forex: forex ? forex.split(',').map(s => s.trim().toUpperCase()) : [],
        });
    }
}
