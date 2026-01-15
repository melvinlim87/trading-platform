import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface PriceData {
    symbol: string;
    price: number;
    change24h?: number;
    changePercent?: number;
    source: string;
    name?: string;
}

@Injectable()
export class PriceProxyService {
    constructor(private configService: ConfigService) { }

    // Get Finnhub API key from environment (optional, free tier available at finnhub.io)
    private get finnhubKey(): string | undefined {
        return this.configService.get<string>('FINNHUB_API_KEY');
    }

    // Stock prices - using multiple fallback sources
    async getStockPrices(symbols: string[]): Promise<Record<string, PriceData>> {
        const prices: Record<string, PriceData> = {};

        if (symbols.length === 0) return prices;

        // Try Finnhub first if API key available (free tier: 60 calls/min)
        if (this.finnhubKey) {
            try {
                for (const symbol of symbols) {
                    const response = await axios.get(
                        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.finnhubKey}`,
                        { timeout: 5000 }
                    );

                    if (response.data && response.data.c > 0) {
                        prices[symbol] = {
                            symbol,
                            price: response.data.c, // Current price
                            change24h: response.data.d, // Change
                            changePercent: response.data.dp, // Change percent
                            source: 'finnhub'
                        };
                    }
                }
                if (Object.keys(prices).length > 0) {
                    console.log(`Fetched ${Object.keys(prices).length} stock prices from Finnhub`);
                    return prices;
                }
            } catch (error: any) {
                console.error('Finnhub API failed:', error.message);
            }
        }

        // Fallback: Try Yahoo Finance with proper headers
        try {
            const symbolList = symbols.join(',');
            const response = await axios.get(
                `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolList}`,
                {
                    headers: {
                        'Accept': '*/*',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Referer': 'https://finance.yahoo.com/',
                        'Origin': 'https://finance.yahoo.com',
                    },
                    timeout: 10000
                }
            );

            const quotes = response.data?.quoteResponse?.result || [];

            for (const quote of quotes) {
                if (quote.regularMarketPrice || quote.ask) {
                    prices[quote.symbol] = {
                        symbol: quote.symbol,
                        price: quote.regularMarketPrice || quote.ask || 0,
                        change24h: quote.regularMarketChange,
                        changePercent: quote.regularMarketChangePercent,
                        name: quote.shortName,
                        source: 'yahoo'
                    };
                }
            }
            if (Object.keys(prices).length > 0) {
                console.log(`Fetched ${Object.keys(prices).length} stock prices from Yahoo Finance`);
            }
        } catch (error: any) {
            console.error('Yahoo Finance API failed:', error.response?.status, error.message);
        }

        return prices;
    }

    // Binance API for crypto (backup for frontend)
    async getCryptoPrices(symbols: string[]): Promise<Record<string, PriceData>> {
        const prices: Record<string, PriceData> = {};

        const symbolMap: Record<string, string> = {
            'BTCUSD': 'BTCUSDT',
            'BTCUSDT': 'BTCUSDT',
            'ETHUSDT': 'ETHUSDT',
            'ETHUSD': 'ETHUSDT',
            'SOLUSD': 'SOLUSDT',
            'XRPUSD': 'XRPUSDT',
        };

        try {
            const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
                timeout: 10000
            });

            const allPrices = response.data;
            const priceMap = new Map(allPrices.map((p: any) => [p.symbol, parseFloat(p.price)]));

            for (const symbol of symbols) {
                const binanceSymbol = symbolMap[symbol] || symbol;
                const price = priceMap.get(binanceSymbol);
                if (typeof price === 'number' && price > 0) {
                    prices[symbol] = {
                        symbol,
                        price,
                        source: 'binance'
                    };
                }
            }
        } catch (error: any) {
            console.error('Binance API failed:', error.message);
        }

        return prices;
    }

    // Forex prices via Frankfurter API (free, ECB rates)
    // Gold via PAXG on Binance (free forex APIs don't include precious metals)
    async getForexPrices(pairs: string[]): Promise<Record<string, PriceData>> {
        const prices: Record<string, PriceData> = {};

        if (pairs.length === 0) return prices;

        // Separate metals from forex (free forex APIs don't include XAU/XAG)
        const metalPairs = pairs.filter(p => ['XAUUSD', 'XAGUSD'].includes(p));
        const forexPairs = pairs.filter(p => !['XAUUSD', 'XAGUSD'].includes(p));

        // Get forex via Frankfurter API (ECB rates - more accurate)
        if (forexPairs.length > 0) {
            const pairMap: Record<string, { base: string; quote: string }> = {
                'EURUSD': { base: 'EUR', quote: 'USD' },
                'GBPUSD': { base: 'GBP', quote: 'USD' },
                'USDJPY': { base: 'USD', quote: 'JPY' },
                'AUDUSD': { base: 'AUD', quote: 'USD' },
                'USDCAD': { base: 'USD', quote: 'CAD' },
            };

            try {
                const response = await axios.get('https://api.frankfurter.app/latest?from=USD', {
                    timeout: 10000
                });

                const data = response.data;

                for (const pair of forexPairs) {
                    const mapping = pairMap[pair];
                    if (mapping && data.rates) {
                        let price: number;
                        if (mapping.base === 'USD') {
                            price = data.rates[mapping.quote];
                        } else if (mapping.quote === 'USD') {
                            price = 1 / data.rates[mapping.base];
                        } else {
                            price = data.rates[mapping.quote] / data.rates[mapping.base];
                        }

                        if (!isNaN(price) && price > 0) {
                            prices[pair] = {
                                symbol: pair,
                                price: parseFloat(price.toFixed(5)),
                                source: 'frankfurter.app (ECB)'
                            };
                            console.log(`Fetched ${pair}: ${prices[pair].price} from Frankfurter`);
                        }
                    }
                }
            } catch (error: any) {
                console.error('Frankfurter API failed:', error.message);
            }
        }

        // Get gold via Binance PAXG (only reliable free source for real-time gold)
        if (metalPairs.includes('XAUUSD')) {
            try {
                const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT', {
                    timeout: 5000
                });
                if (response.data && response.data.price) {
                    const goldPrice = parseFloat(response.data.price);
                    prices['XAUUSD'] = {
                        symbol: 'XAUUSD',
                        price: goldPrice,
                        source: 'binance (PAXG)'
                    };
                    console.log(`Fetched XAUUSD: $${goldPrice} from Binance PAXG`);
                }
            } catch (error: any) {
                console.error('PAXG gold fetch failed:', error.message);
            }
        }

        return prices;
    }

    // Get all prices in one call
    async getAllPrices(request: {
        crypto?: string[];
        stocks?: string[];
        forex?: string[];
    }): Promise<{
        crypto: Record<string, PriceData>;
        stocks: Record<string, PriceData>;
        forex: Record<string, PriceData>;
    }> {
        const [crypto, stocks, forex] = await Promise.all([
            request.crypto?.length ? this.getCryptoPrices(request.crypto) : {},
            request.stocks?.length ? this.getStockPrices(request.stocks) : {},
            request.forex?.length ? this.getForexPrices(request.forex) : {},
        ]);

        return { crypto, stocks, forex };
    }
}
