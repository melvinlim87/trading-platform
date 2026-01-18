// Comprehensive Asset Library with common symbols and names

export interface AssetInfo {
    symbol: string;
    name: string;
    assetClass: string;
    icon?: string;
}

// Popular Stocks
export const stockAssets: AssetInfo[] = [
    // US Tech Giants
    { symbol: 'AAPL', name: 'Apple Inc', assetClass: 'stock' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', assetClass: 'stock' },
    { symbol: 'GOOGL', name: 'Alphabet Inc (Google)', assetClass: 'stock' },
    { symbol: 'AMZN', name: 'Amazon.com Inc', assetClass: 'stock' },
    { symbol: 'META', name: 'Meta Platforms (Facebook)', assetClass: 'stock' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', assetClass: 'stock' },
    { symbol: 'TSLA', name: 'Tesla Inc', assetClass: 'stock' },
    { symbol: 'AMD', name: 'Advanced Micro Devices', assetClass: 'stock' },
    { symbol: 'INTC', name: 'Intel Corporation', assetClass: 'stock' },
    { symbol: 'CRM', name: 'Salesforce Inc', assetClass: 'stock' },
    { symbol: 'ADBE', name: 'Adobe Inc', assetClass: 'stock' },
    { symbol: 'NFLX', name: 'Netflix Inc', assetClass: 'stock' },
    { symbol: 'PYPL', name: 'PayPal Holdings', assetClass: 'stock' },
    { symbol: 'UBER', name: 'Uber Technologies', assetClass: 'stock' },
    { symbol: 'ABNB', name: 'Airbnb Inc', assetClass: 'stock' },
    // Semiconductors
    { symbol: 'AVGO', name: 'Broadcom Inc', assetClass: 'stock' },
    { symbol: 'QCOM', name: 'Qualcomm Inc', assetClass: 'stock' },
    { symbol: 'TSM', name: 'Taiwan Semiconductor', assetClass: 'stock' },
    { symbol: 'ASML', name: 'ASML Holding NV', assetClass: 'stock' },
    { symbol: 'MU', name: 'Micron Technology', assetClass: 'stock' },
    // Finance
    { symbol: 'JPM', name: 'JPMorgan Chase', assetClass: 'stock' },
    { symbol: 'BAC', name: 'Bank of America', assetClass: 'stock' },
    { symbol: 'WFC', name: 'Wells Fargo', assetClass: 'stock' },
    { symbol: 'GS', name: 'Goldman Sachs', assetClass: 'stock' },
    { symbol: 'MS', name: 'Morgan Stanley', assetClass: 'stock' },
    { symbol: 'V', name: 'Visa Inc', assetClass: 'stock' },
    { symbol: 'MA', name: 'Mastercard Inc', assetClass: 'stock' },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway B', assetClass: 'stock' },
    // Healthcare
    { symbol: 'JNJ', name: 'Johnson & Johnson', assetClass: 'stock' },
    { symbol: 'UNH', name: 'UnitedHealth Group', assetClass: 'stock' },
    { symbol: 'PFE', name: 'Pfizer Inc', assetClass: 'stock' },
    { symbol: 'MRK', name: 'Merck & Co', assetClass: 'stock' },
    { symbol: 'ABBV', name: 'AbbVie Inc', assetClass: 'stock' },
    { symbol: 'LLY', name: 'Eli Lilly', assetClass: 'stock' },
    { symbol: 'TMO', name: 'Thermo Fisher Scientific', assetClass: 'stock' },
    // Consumer
    { symbol: 'KO', name: 'Coca-Cola Company', assetClass: 'stock' },
    { symbol: 'PEP', name: 'PepsiCo Inc', assetClass: 'stock' },
    { symbol: 'WMT', name: 'Walmart Inc', assetClass: 'stock' },
    { symbol: 'COST', name: 'Costco Wholesale', assetClass: 'stock' },
    { symbol: 'HD', name: 'Home Depot', assetClass: 'stock' },
    { symbol: 'MCD', name: "McDonald's Corp", assetClass: 'stock' },
    { symbol: 'NKE', name: 'Nike Inc', assetClass: 'stock' },
    { symbol: 'SBUX', name: 'Starbucks Corp', assetClass: 'stock' },
    { symbol: 'DIS', name: 'Walt Disney Co', assetClass: 'stock' },
    // Energy
    { symbol: 'XOM', name: 'Exxon Mobil', assetClass: 'stock' },
    { symbol: 'CVX', name: 'Chevron Corp', assetClass: 'stock' },
    // Industrial
    { symbol: 'BA', name: 'Boeing Company', assetClass: 'stock' },
    { symbol: 'CAT', name: 'Caterpillar Inc', assetClass: 'stock' },
    { symbol: 'GE', name: 'General Electric', assetClass: 'stock' },
    // Singapore Stocks
    { symbol: 'D05.SI', name: 'DBS Group Holdings', assetClass: 'stock' },
    { symbol: 'O39.SI', name: 'OCBC Bank', assetClass: 'stock' },
    { symbol: 'U11.SI', name: 'UOB Bank', assetClass: 'stock' },
    { symbol: 'Z74.SI', name: 'Singtel', assetClass: 'stock' },
    { symbol: 'C6L.SI', name: 'Singapore Airlines', assetClass: 'stock' },
    { symbol: 'BN4.SI', name: 'Keppel Corporation', assetClass: 'stock' },
    { symbol: 'S58.SI', name: 'SATS Ltd', assetClass: 'stock' },
    // Hong Kong Stocks
    { symbol: '0700.HK', name: 'Tencent Holdings', assetClass: 'stock' },
    { symbol: '9988.HK', name: 'Alibaba Group', assetClass: 'stock' },
    { symbol: '0005.HK', name: 'HSBC Holdings', assetClass: 'stock' },
    { symbol: '1299.HK', name: 'AIA Group', assetClass: 'stock' },
    { symbol: '2318.HK', name: 'Ping An Insurance', assetClass: 'stock' },
    // Chinese ADRs
    { symbol: 'BABA', name: 'Alibaba Group ADR', assetClass: 'stock' },
    { symbol: 'JD', name: 'JD.com Inc ADR', assetClass: 'stock' },
    { symbol: 'PDD', name: 'PDD Holdings (Pinduoduo)', assetClass: 'stock' },
    { symbol: 'BIDU', name: 'Baidu Inc ADR', assetClass: 'stock' },
    { symbol: 'NIO', name: 'NIO Inc ADR', assetClass: 'stock' },
    { symbol: 'XPEV', name: 'XPeng Inc ADR', assetClass: 'stock' },
    { symbol: 'LI', name: 'Li Auto Inc ADR', assetClass: 'stock' },
];

// Cryptocurrencies
export const cryptoAssets: AssetInfo[] = [
    // Major Coins
    { symbol: 'BTCUSD', name: 'Bitcoin', assetClass: 'crypto' },
    { symbol: 'BTCUSDT', name: 'Bitcoin/Tether', assetClass: 'crypto' },
    { symbol: 'ETHUSD', name: 'Ethereum', assetClass: 'crypto' },
    { symbol: 'ETHUSDT', name: 'Ethereum/Tether', assetClass: 'crypto' },
    { symbol: 'BNBUSD', name: 'Binance Coin', assetClass: 'crypto' },
    { symbol: 'SOLUSD', name: 'Solana', assetClass: 'crypto' },
    { symbol: 'XRPUSD', name: 'Ripple XRP', assetClass: 'crypto' },
    { symbol: 'ADAUSD', name: 'Cardano', assetClass: 'crypto' },
    { symbol: 'DOGEUSD', name: 'Dogecoin', assetClass: 'crypto' },
    { symbol: 'DOTUSD', name: 'Polkadot', assetClass: 'crypto' },
    { symbol: 'MATICUSD', name: 'Polygon', assetClass: 'crypto' },
    { symbol: 'LINKUSD', name: 'Chainlink', assetClass: 'crypto' },
    { symbol: 'AVAXUSD', name: 'Avalanche', assetClass: 'crypto' },
    { symbol: 'ATOMUSD', name: 'Cosmos', assetClass: 'crypto' },
    { symbol: 'UNIUSD', name: 'Uniswap', assetClass: 'crypto' },
    { symbol: 'AAVEUSD', name: 'Aave', assetClass: 'crypto' },
    { symbol: 'LTCUSD', name: 'Litecoin', assetClass: 'crypto' },
    { symbol: 'BCHUSD', name: 'Bitcoin Cash', assetClass: 'crypto' },
    { symbol: 'XLMUSD', name: 'Stellar Lumens', assetClass: 'crypto' },
    { symbol: 'VETUSD', name: 'VeChain', assetClass: 'crypto' },
    { symbol: 'FILUSD', name: 'Filecoin', assetClass: 'crypto' },
    { symbol: 'TRXUSD', name: 'Tron', assetClass: 'crypto' },
    { symbol: 'NEARUSD', name: 'NEAR Protocol', assetClass: 'crypto' },
    { symbol: 'ALGOUSD', name: 'Algorand', assetClass: 'crypto' },
    { symbol: 'APTUSD', name: 'Aptos', assetClass: 'crypto' },
    { symbol: 'ARBUSD', name: 'Arbitrum', assetClass: 'crypto' },
    { symbol: 'OPUSD', name: 'Optimism', assetClass: 'crypto' },
    { symbol: 'INJUSD', name: 'Injective', assetClass: 'crypto' },
    { symbol: 'SUIUSD', name: 'Sui', assetClass: 'crypto' },
    { symbol: 'SEIUSD', name: 'Sei', assetClass: 'crypto' },
    // Meme Coins
    { symbol: 'SHIBUSD', name: 'Shiba Inu', assetClass: 'crypto' },
    { symbol: 'PEPEUSD', name: 'Pepe', assetClass: 'crypto' },
    { symbol: 'FLOKIUSD', name: 'Floki Inu', assetClass: 'crypto' },
    { symbol: 'BONKUSD', name: 'Bonk', assetClass: 'crypto' },
    { symbol: 'WIFUSD', name: 'dogwifhat', assetClass: 'crypto' },
];

// Forex Pairs
export const forexAssets: AssetInfo[] = [
    // Major Pairs
    { symbol: 'EURUSD', name: 'Euro/US Dollar', assetClass: 'forex' },
    { symbol: 'GBPUSD', name: 'British Pound/US Dollar', assetClass: 'forex' },
    { symbol: 'USDJPY', name: 'US Dollar/Japanese Yen', assetClass: 'forex' },
    { symbol: 'USDCHF', name: 'US Dollar/Swiss Franc', assetClass: 'forex' },
    { symbol: 'AUDUSD', name: 'Australian Dollar/US Dollar', assetClass: 'forex' },
    { symbol: 'USDCAD', name: 'US Dollar/Canadian Dollar', assetClass: 'forex' },
    { symbol: 'NZDUSD', name: 'New Zealand Dollar/US Dollar', assetClass: 'forex' },
    // Cross Pairs
    { symbol: 'EURGBP', name: 'Euro/British Pound', assetClass: 'forex' },
    { symbol: 'EURJPY', name: 'Euro/Japanese Yen', assetClass: 'forex' },
    { symbol: 'GBPJPY', name: 'British Pound/Japanese Yen', assetClass: 'forex' },
    { symbol: 'AUDJPY', name: 'Australian Dollar/Japanese Yen', assetClass: 'forex' },
    { symbol: 'CADJPY', name: 'Canadian Dollar/Japanese Yen', assetClass: 'forex' },
    { symbol: 'CHFJPY', name: 'Swiss Franc/Japanese Yen', assetClass: 'forex' },
    { symbol: 'EURAUD', name: 'Euro/Australian Dollar', assetClass: 'forex' },
    { symbol: 'EURCHF', name: 'Euro/Swiss Franc', assetClass: 'forex' },
    { symbol: 'EURCAD', name: 'Euro/Canadian Dollar', assetClass: 'forex' },
    { symbol: 'GBPAUD', name: 'British Pound/Australian Dollar', assetClass: 'forex' },
    { symbol: 'GBPCAD', name: 'British Pound/Canadian Dollar', assetClass: 'forex' },
    { symbol: 'GBPCHF', name: 'British Pound/Swiss Franc', assetClass: 'forex' },
    { symbol: 'AUDCAD', name: 'Australian Dollar/Canadian Dollar', assetClass: 'forex' },
    { symbol: 'AUDCHF', name: 'Australian Dollar/Swiss Franc', assetClass: 'forex' },
    { symbol: 'AUDNZD', name: 'Australian Dollar/New Zealand Dollar', assetClass: 'forex' },
    { symbol: 'NZDJPY', name: 'New Zealand Dollar/Japanese Yen', assetClass: 'forex' },
    // Asian Pairs
    { symbol: 'USDSGD', name: 'US Dollar/Singapore Dollar', assetClass: 'forex' },
    { symbol: 'USDHKD', name: 'US Dollar/Hong Kong Dollar', assetClass: 'forex' },
    { symbol: 'USDCNH', name: 'US Dollar/Chinese Yuan', assetClass: 'forex' },
    { symbol: 'USDKRW', name: 'US Dollar/Korean Won', assetClass: 'forex' },
    { symbol: 'USDTHB', name: 'US Dollar/Thai Baht', assetClass: 'forex' },
    { symbol: 'USDINR', name: 'US Dollar/Indian Rupee', assetClass: 'forex' },
    { symbol: 'USDMYR', name: 'US Dollar/Malaysian Ringgit', assetClass: 'forex' },
    { symbol: 'USDPHP', name: 'US Dollar/Philippine Peso', assetClass: 'forex' },
    { symbol: 'USDIDR', name: 'US Dollar/Indonesian Rupiah', assetClass: 'forex' },
    // Exotic
    { symbol: 'USDMXN', name: 'US Dollar/Mexican Peso', assetClass: 'forex' },
    { symbol: 'USDZAR', name: 'US Dollar/South African Rand', assetClass: 'forex' },
    { symbol: 'USDTRY', name: 'US Dollar/Turkish Lira', assetClass: 'forex' },
    { symbol: 'USDSEK', name: 'US Dollar/Swedish Krona', assetClass: 'forex' },
    { symbol: 'USDNOK', name: 'US Dollar/Norwegian Krone', assetClass: 'forex' },
];

// ETFs
export const etfAssets: AssetInfo[] = [
    // US Index ETFs
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF', assetClass: 'etf' },
    { symbol: 'QQQ', name: 'Invesco QQQ (Nasdaq 100)', assetClass: 'etf' },
    { symbol: 'IWM', name: 'iShares Russell 2000 ETF', assetClass: 'etf' },
    { symbol: 'DIA', name: 'SPDR Dow Jones Industrial ETF', assetClass: 'etf' },
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', assetClass: 'etf' },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', assetClass: 'etf' },
    { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', assetClass: 'etf' },
    // Sector ETFs
    { symbol: 'XLK', name: 'Technology Select Sector SPDR', assetClass: 'etf' },
    { symbol: 'XLF', name: 'Financial Select Sector SPDR', assetClass: 'etf' },
    { symbol: 'XLE', name: 'Energy Select Sector SPDR', assetClass: 'etf' },
    { symbol: 'XLV', name: 'Health Care Select Sector SPDR', assetClass: 'etf' },
    { symbol: 'XLI', name: 'Industrial Select Sector SPDR', assetClass: 'etf' },
    { symbol: 'XLY', name: 'Consumer Discretionary SPDR', assetClass: 'etf' },
    { symbol: 'XLP', name: 'Consumer Staples Select SPDR', assetClass: 'etf' },
    { symbol: 'XLU', name: 'Utilities Select Sector SPDR', assetClass: 'etf' },
    { symbol: 'XLRE', name: 'Real Estate Select Sector SPDR', assetClass: 'etf' },
    // Bond ETFs
    { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond', assetClass: 'etf' },
    { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', assetClass: 'etf' },
    { symbol: 'AGG', name: 'iShares Core US Aggregate Bond', assetClass: 'etf' },
    { symbol: 'HYG', name: 'iShares iBoxx High Yield Corporate', assetClass: 'etf' },
    { symbol: 'LQD', name: 'iShares iBoxx Investment Grade', assetClass: 'etf' },
    // International ETFs
    { symbol: 'EFA', name: 'iShares MSCI EAFE ETF', assetClass: 'etf' },
    { symbol: 'EEM', name: 'iShares MSCI Emerging Markets', assetClass: 'etf' },
    { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets', assetClass: 'etf' },
    { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets', assetClass: 'etf' },
    { symbol: 'VXUS', name: 'Vanguard Total International Stock', assetClass: 'etf' },
    { symbol: 'FXI', name: 'iShares China Large-Cap ETF', assetClass: 'etf' },
    { symbol: 'MCHI', name: 'iShares MSCI China ETF', assetClass: 'etf' },
    { symbol: 'EWJ', name: 'iShares MSCI Japan ETF', assetClass: 'etf' },
    { symbol: 'EWZ', name: 'iShares MSCI Brazil ETF', assetClass: 'etf' },
    // Leveraged ETFs
    { symbol: 'TQQQ', name: 'ProShares UltraPro QQQ (3x)', assetClass: 'etf' },
    { symbol: 'SQQQ', name: 'ProShares UltraPro Short QQQ (-3x)', assetClass: 'etf' },
    { symbol: 'SPXL', name: 'Direxion Daily S&P 500 Bull 3x', assetClass: 'etf' },
    { symbol: 'SPXS', name: 'Direxion Daily S&P 500 Bear 3x', assetClass: 'etf' },
    // Thematic ETFs
    { symbol: 'ARKK', name: 'ARK Innovation ETF', assetClass: 'etf' },
    { symbol: 'ARKG', name: 'ARK Genomic Revolution ETF', assetClass: 'etf' },
    { symbol: 'ARKF', name: 'ARK Fintech Innovation ETF', assetClass: 'etf' },
    { symbol: 'SOXX', name: 'iShares Semiconductor ETF', assetClass: 'etf' },
    { symbol: 'SMH', name: 'VanEck Semiconductor ETF', assetClass: 'etf' },
    { symbol: 'KWEB', name: 'KraneShares CSI China Internet', assetClass: 'etf' },
    // Commodity ETFs
    { symbol: 'GLD', name: 'SPDR Gold Shares', assetClass: 'etf' },
    { symbol: 'SLV', name: 'iShares Silver Trust', assetClass: 'etf' },
    { symbol: 'USO', name: 'United States Oil Fund', assetClass: 'etf' },
    { symbol: 'UNG', name: 'United States Natural Gas Fund', assetClass: 'etf' },
];

// Unit Trusts / Mutual Funds (UCITS ETFs)
export const unitTrustAssets: AssetInfo[] = [
    // Vanguard Ireland UCITS
    { symbol: 'VWRA', name: 'Vanguard FTSE All-World (Acc)', assetClass: 'unit_trust' },
    { symbol: 'VWRD', name: 'Vanguard FTSE All-World (Dist)', assetClass: 'unit_trust' },
    { symbol: 'VUSD', name: 'Vanguard S&P 500 (Dist)', assetClass: 'unit_trust' },
    { symbol: 'VUAA', name: 'Vanguard S&P 500 (Acc)', assetClass: 'unit_trust' },
    { symbol: 'VUSA', name: 'Vanguard S&P 500 (USD)', assetClass: 'unit_trust' },
    { symbol: 'VDEV', name: 'Vanguard FTSE Developed World', assetClass: 'unit_trust' },
    { symbol: 'VFEM', name: 'Vanguard FTSE Emerging Markets', assetClass: 'unit_trust' },
    // iShares UCITS
    { symbol: 'SWDA', name: 'iShares Core MSCI World (Acc)', assetClass: 'unit_trust' },
    { symbol: 'IWDA', name: 'iShares Core MSCI World (USD)', assetClass: 'unit_trust' },
    { symbol: 'EIMI', name: 'iShares Core EM IMI (Acc)', assetClass: 'unit_trust' },
    { symbol: 'CSPX', name: 'iShares Core S&P 500 (Acc)', assetClass: 'unit_trust' },
    { symbol: 'IUIT', name: 'iShares S&P 500 Info Tech', assetClass: 'unit_trust' },
    { symbol: 'IUFS', name: 'iShares S&P 500 Financials', assetClass: 'unit_trust' },
    { symbol: 'IGLN', name: 'iShares Physical Gold ETC', assetClass: 'unit_trust' },
    { symbol: 'SGLN', name: 'iShares Physical Silver ETC', assetClass: 'unit_trust' },
    // SPDR UCITS
    { symbol: 'SPY5', name: 'SPDR S&P 500 UCITS', assetClass: 'unit_trust' },
    { symbol: 'SPXS', name: 'SPDR S&P US Technology', assetClass: 'unit_trust' },
    // Invesco UCITS
    { symbol: 'EQQQ', name: 'Invesco EQQQ Nasdaq-100 (Acc)', assetClass: 'unit_trust' },
    // Xtrackers UCITS
    { symbol: 'XDWD', name: 'Xtrackers MSCI World', assetClass: 'unit_trust' },
    { symbol: 'XDWT', name: 'Xtrackers MSCI USA IT', assetClass: 'unit_trust' },
    // Lion Global & Singapore Funds
    { symbol: 'ES3', name: 'STI ETF', assetClass: 'unit_trust' },
    { symbol: 'G3B', name: 'Nikko AM STI ETF', assetClass: 'unit_trust' },
];

// Commodities
export const commodityAssets: AssetInfo[] = [
    // Precious Metals
    { symbol: 'XAUUSD', name: 'Gold', assetClass: 'commodity' },
    { symbol: 'XAGUSD', name: 'Silver', assetClass: 'commodity' },
    { symbol: 'XPTUSD', name: 'Platinum', assetClass: 'commodity' },
    { symbol: 'XPDUSD', name: 'Palladium', assetClass: 'commodity' },
    // Energy
    { symbol: 'USOIL', name: 'WTI Crude Oil', assetClass: 'commodity' },
    { symbol: 'UKOIL', name: 'Brent Crude Oil', assetClass: 'commodity' },
    { symbol: 'NGAS', name: 'Natural Gas', assetClass: 'commodity' },
    // Agriculture
    { symbol: 'CORN', name: 'Corn', assetClass: 'commodity' },
    { symbol: 'WHEAT', name: 'Wheat', assetClass: 'commodity' },
    { symbol: 'SOYB', name: 'Soybeans', assetClass: 'commodity' },
    { symbol: 'COFFEE', name: 'Coffee', assetClass: 'commodity' },
    { symbol: 'SUGAR', name: 'Sugar', assetClass: 'commodity' },
    { symbol: 'COTTON', name: 'Cotton', assetClass: 'commodity' },
    // Industrial Metals
    { symbol: 'COPPER', name: 'Copper', assetClass: 'commodity' },
    { symbol: 'ALUMINIUM', name: 'Aluminium', assetClass: 'commodity' },
    { symbol: 'ZINC', name: 'Zinc', assetClass: 'commodity' },
    { symbol: 'NICKEL', name: 'Nickel', assetClass: 'commodity' },
];

// Combined library for searching
export const assetLibrary: AssetInfo[] = [
    ...stockAssets,
    ...cryptoAssets,
    ...forexAssets,
    ...etfAssets,
    ...unitTrustAssets,
    ...commodityAssets,
];

// Search function to find assets
export function searchAssets(query: string, category?: string): AssetInfo[] {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    let assetsToSearch = assetLibrary;

    // Filter by category if specified
    if (category && category !== 'other') {
        assetsToSearch = assetLibrary.filter(a => a.assetClass === category);
    }

    // Search by symbol or name
    return assetsToSearch
        .filter(asset =>
            asset.symbol.toLowerCase().includes(searchTerm) ||
            asset.name.toLowerCase().includes(searchTerm)
        )
        .slice(0, 15); // Limit to 15 results
}

// Get asset by exact symbol match
export function getAssetBySymbol(symbol: string): AssetInfo | undefined {
    return assetLibrary.find(a => a.symbol.toLowerCase() === symbol.toLowerCase());
}
