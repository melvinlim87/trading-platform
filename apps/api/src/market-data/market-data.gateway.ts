import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MarketDataService } from './market-data.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class MarketDataGateway {
    @WebSocketServer()
    server: Server;

    constructor(private marketDataService: MarketDataService) {
        // Simulate price updates every second
        setInterval(() => {
            this.broadcastPriceUpdates();
        }, 1000);
    }

    @SubscribeMessage('subscribeToTicker')
    handleSubscribe(@MessageBody() symbol: string): string {
        return `Subscribed to ${symbol}`;
    }

    private broadcastPriceUpdates() {
        const symbols = ['AAPL', 'TSLA', 'GOOGL'];
        symbols.forEach(symbol => {
            const price = this.marketDataService.getPrice(symbol);
            this.server.emit('priceUpdate', { symbol, price });
        });
    }
}
