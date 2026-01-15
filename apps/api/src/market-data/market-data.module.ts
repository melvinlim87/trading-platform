import { Module } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { MarketDataGateway } from './market-data.gateway';
import { PriceProxyService } from './price-proxy.service';
import { PriceProxyController } from './price-proxy.controller';

@Module({
    controllers: [PriceProxyController],
    providers: [MarketDataService, MarketDataGateway, PriceProxyService],
    exports: [MarketDataService, PriceProxyService],
})
export class MarketDataModule { }
