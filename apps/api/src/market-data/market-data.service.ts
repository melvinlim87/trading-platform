import { Injectable } from '@nestjs/common';

@Injectable()
export class MarketDataService {
    // Mock price storage
    private prices: Map<string, number> = new Map();

    constructor() {
        // Initialize some mock data
        this.prices.set('AAPL', 150.00);
        this.prices.set('TSLA', 200.00);
        this.prices.set('GOOGL', 2800.00);
    }

    getPrice(symbol: string): number {
        // In a real app, this would fetch from Redis or an external API
        // For now, return a mock price with slight randomization to simulate movement
        const basePrice = this.prices.get(symbol) || 100;
        const randomMove = (Math.random() - 0.5) * 0.5; // +/- 0.25
        return basePrice + randomMove;
    }
}
