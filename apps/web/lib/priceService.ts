// Price service for fetching real-time prices from various APIs
// Binance for crypto, ExchangeRate API for forex, Yahoo Finance for stocks

export interface PriceData {
    symbol: string;
    price: number;
    change24h?: number;
    source: string;
}

// Binance API for crypto prices (no auth required)
export async function getCryptoPrices(symbols: string[]): Promise<Record<string, PriceData>> {
    const prices: Record<string, PriceData> = {};

    const symbolMap: Record<string, string> = {
        'BTCUSD': 'BTCUSDT',
        'BTCUSDT': 'BTCUSDT',
        'ETHUSDT': 'ETHUSDT',
        'ETHUSD': 'ETHUSDT',
    };

    try {
        // Fetch all prices at once
        const response = await fetch('https://api.binance.com/api/v3/ticker/price');
        if (!response.ok) throw new Error('Binance API error');

        const allPrices = await response.json();
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
    } catch (error) {
        console.error('Failed to fetch crypto prices from Binance:', error);
    }

    return prices;
}

// Forex prices via backend proxy (Finnhub)
export async function getForexPrices(pairs: string[]): Promise<Record<string, PriceData>> {
    const prices: Record<string, PriceData> = {};

    try {
        const pairList = pairs.join(',');
        const response = await fetch(
            `http://localhost:3001/prices/forex?pairs=${pairList}`
        );

        if (!response.ok) throw new Error('Forex proxy API error');

        const data = await response.json();

        for (const [symbol, priceData] of Object.entries(data)) {
            const pd = priceData as PriceData;
            prices[symbol] = {
                symbol: pd.symbol,
                price: pd.price,
                change24h: pd.change24h,
                source: 'finnhub (via proxy)'
            };
        }
    } catch (error) {
        console.log('Forex price proxy not available');
    }

    return prices;
}

// Stock prices via backend proxy (to avoid CORS issues with Yahoo Finance)
export async function getStockPrices(symbols: string[]): Promise<Record<string, PriceData>> {
    const prices: Record<string, PriceData> = {};

    try {
        const symbolList = symbols.join(',');
        // Use backend proxy to fetch from Yahoo Finance
        const response = await fetch(
            `http://localhost:3001/prices/stocks?symbols=${symbolList}`
        );

        if (!response.ok) throw new Error('Price proxy API error');

        const data = await response.json();

        for (const [symbol, priceData] of Object.entries(data)) {
            const pd = priceData as PriceData;
            prices[symbol] = {
                symbol: pd.symbol,
                price: pd.price,
                change24h: pd.change24h,
                source: 'yahoo (via proxy)'
            };
        }
    } catch (error) {
        console.log('Stock price proxy not available, using fallback');
    }

    return prices;
}

// Commodities (Gold/Silver) via backend proxy (uses Finnhub forex endpoint for XAUUSD)
export async function getCommodityPrices(symbols: string[]): Promise<Record<string, PriceData>> {
    const prices: Record<string, PriceData> = {};

    // Route commodities through the forex endpoint since Finnhub treats them as forex pairs
    try {
        const symbolList = symbols.join(',');
        const response = await fetch(
            `http://localhost:3001/prices/forex?pairs=${symbolList}`
        );

        if (!response.ok) throw new Error('Commodity proxy API error');

        const data = await response.json();

        for (const [symbol, priceData] of Object.entries(data)) {
            const pd = priceData as PriceData;
            prices[symbol] = {
                symbol: pd.symbol,
                price: pd.price,
                change24h: pd.change24h,
                source: 'finnhub (via proxy)'
            };
        }
    } catch (error) {
        console.log('Commodity price proxy not available');
    }

    return prices;
}

// Master function to fetch all prices
export async function fetchAllPrices(positions: { symbol: string; assetClass: string }[]): Promise<Record<string, PriceData>> {
    const cryptoSymbols = positions.filter(p => p.assetClass === 'crypto').map(p => p.symbol);
    const forexSymbols = positions.filter(p => p.assetClass === 'forex').map(p => p.symbol);
    const stockSymbols = positions.filter(p => ['stock', 'etf'].includes(p.assetClass)).map(p => p.symbol);
    const commoditySymbols = positions.filter(p => p.assetClass === 'commodity').map(p => p.symbol);

    const [cryptoPrices, forexPrices, stockPrices, commodityPrices] = await Promise.all([
        cryptoSymbols.length > 0 ? getCryptoPrices(cryptoSymbols) : Promise.resolve({} as Record<string, PriceData>),
        forexSymbols.length > 0 ? getForexPrices(forexSymbols) : Promise.resolve({} as Record<string, PriceData>),
        stockSymbols.length > 0 ? getStockPrices(stockSymbols) : Promise.resolve({} as Record<string, PriceData>),
        commoditySymbols.length > 0 ? getCommodityPrices(commoditySymbols) : Promise.resolve({} as Record<string, PriceData>),
    ]);

    return {
        ...cryptoPrices,
        ...forexPrices,
        ...stockPrices,
        ...commodityPrices,
    };
}
