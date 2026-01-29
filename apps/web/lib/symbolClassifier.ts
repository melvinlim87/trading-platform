/**
 * Symbol Classification Utility
 * Auto-detects asset class based on symbol patterns and known symbols
 */

export type AssetClass = 'crypto' | 'forex' | 'stock' | 'etf' | 'commodity' | 'unit_trust';

// Known crypto symbols
const CRYPTO_SYMBOLS = new Set([
    'BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOGE', 'DOT', 'AVAX', 'MATIC', 'LINK',
    'UNI', 'LTC', 'BCH', 'XLM', 'ATOM', 'ETC', 'FIL', 'TRX', 'NEAR', 'VET',
    'ALGO', 'ICP', 'AAVE', 'EOS', 'XMR', 'SAND', 'MANA', 'AXS', 'CRO', 'FTM',
    'SHIB', 'APE', 'GRT', 'LDO', 'THETA', 'SNX', 'MKR', 'COMP', 'ZEC', 'DASH',
    'ENJ', 'BAT', '1INCH', 'SUSHI', 'YFI', 'OP', 'ARB', 'SUI', 'APT', 'INJ',
    'BTCUSD', 'ETHUSD', 'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'DOGEUSDT',
]);

// Known forex pairs (major/minor/exotic)
const FOREX_PAIRS = new Set([
    'EURUSD', 'USDJPY', 'GBPUSD', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
    'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'EURAUD', 'EURCHF', 'AUDNZD',
    'NZDJPY', 'GBPCHF', 'GBPAUD', 'EURCAD', 'AUDCAD', 'CADJPY', 'CHFJPY',
    'USDHKD', 'USDSGD', 'USDZAR', 'USDMXN', 'USDSEK', 'USDNOK', 'USDTRY',
]);

// Known commodity symbols
const COMMODITY_SYMBOLS = new Set([
    'XAUUSD', 'XAGUSD', 'GOLD', 'SILVER', 'GC', 'SI', 'CL', 'NG', 'HG',
    'WTIUSD', 'BRENTUSD', 'OIL', 'COPPER', 'PLATINUM', 'PALLADIUM',
    'CORN', 'WHEAT', 'SOYBEAN', 'COFFEE', 'SUGAR', 'COTTON', 'COCOA',
]);

// Known ETF symbols (popular US ETFs)
const ETF_SYMBOLS = new Set([
    'SPY', 'QQQ', 'IWM', 'DIA', 'VTI', 'VOO', 'VEA', 'VWO', 'EFA', 'EEM',
    'GLD', 'SLV', 'USO', 'TLT', 'IEF', 'LQD', 'HYG', 'VNQ', 'XLF', 'XLE',
    'XLK', 'XLV', 'XLI', 'XLY', 'XLP', 'XLU', 'XLB', 'ARKK', 'ARKG', 'ARKW',
    'SCHD', 'JEPI', 'VYM', 'DGRO', 'VIG', 'DVY', 'HDV', 'SDY', 'NOBL',
]);

// Known unit trust symbols (common Ireland/UK ETFs treated as unit trusts)
const UNIT_TRUST_SYMBOLS = new Set([
    'VWRA', 'VWRL', 'VUSA', 'VUAG', 'VWCE', 'SWDA', 'IWDA', 'EIMI', 'VFEM',
    'CSPX', 'IUSA', 'ISF', 'VUKE', 'VMID', 'VHYL', 'VGOV', 'VEMT', 'VAGP',
]);

// Crypto suffixes that indicate a crypto pair
const CRYPTO_SUFFIXES = ['USD', 'USDT', 'USDC', 'BUSD', 'BTC', 'ETH', 'PERP'];

// Forex currency codes
const FOREX_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'HKD', 'SGD', 'ZAR', 'MXN', 'SEK', 'NOK', 'TRY', 'INR', 'CNY', 'KRW'];

/**
 * Classify a symbol into an asset class
 */
export function classifySymbol(symbol: string): AssetClass {
    const upper = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Direct matches first
    if (CRYPTO_SYMBOLS.has(upper)) return 'crypto';
    if (FOREX_PAIRS.has(upper)) return 'forex';
    if (COMMODITY_SYMBOLS.has(upper)) return 'commodity';
    if (ETF_SYMBOLS.has(upper)) return 'etf';
    if (UNIT_TRUST_SYMBOLS.has(upper)) return 'unit_trust';

    // Pattern matching

    // Crypto patterns: ends with USDT, PERP, or common crypto base
    for (const suffix of CRYPTO_SUFFIXES) {
        if (upper.endsWith(suffix) && upper.length > suffix.length) {
            const base = upper.slice(0, -suffix.length);
            if (CRYPTO_SYMBOLS.has(base) || base.length <= 5) {
                return 'crypto';
            }
        }
    }

    // Forex pattern: exactly 6 chars with two valid currency codes
    if (upper.length === 6) {
        const base = upper.slice(0, 3);
        const quote = upper.slice(3);
        if (FOREX_CURRENCIES.includes(base) && FOREX_CURRENCIES.includes(quote)) {
            return 'forex';
        }
    }

    // Commodity patterns (precious metals)
    if (upper.startsWith('XAU') || upper.startsWith('XAG') || upper.startsWith('XPT') || upper.startsWith('XPD')) {
        return 'commodity';
    }

    // Default to stock for unknown symbols
    return 'stock';
}

/**
 * Get asset class config for display
 */
export const assetClassOptions: { value: AssetClass; label: string; icon: string; color: string }[] = [
    { value: 'crypto', label: 'Cryptocurrency', icon: '₿', color: '#f59e0b' },
    { value: 'forex', label: 'Forex', icon: '💱', color: '#10b981' },
    { value: 'stock', label: 'Stocks', icon: '📈', color: '#3b82f6' },
    { value: 'etf', label: 'ETFs', icon: '📊', color: '#ed6bff' },
    { value: 'commodity', label: 'Commodities', icon: '🥇', color: '#84cc16' },
    { value: 'unit_trust', label: 'Unit Trusts', icon: '🏦', color: '#a855f7' },
];

/**
 * Classify multiple symbols at once
 */
export function classifySymbols(symbols: string[]): Record<string, AssetClass> {
    const result: Record<string, AssetClass> = {};
    for (const symbol of symbols) {
        result[symbol] = classifySymbol(symbol);
    }
    return result;
}
