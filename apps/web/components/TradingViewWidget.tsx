// TradingViewWidget.jsx
import React, { useEffect, useRef, memo, useState, useMemo } from 'react';

type AssetSymbol = {
  label: string;
  value: string;
};

type AssetClass = {
  key: string;
  label: string;
  symbols: AssetSymbol[];
};

const ASSET_CLASSES: AssetClass[] = [
  {
    key: 'forex',
    label: 'Forex',
    symbols: [
      { label: 'XAU/USD · Gold', value: 'OANDA:XAUUSD' },
      { label: 'EUR/USD', value: 'FX:EURUSD' },
      { label: 'GBP/USD', value: 'FX:GBPUSD' },
      { label: 'USD/JPY', value: 'FX:USDJPY' },
      { label: 'USD/CAD', value: 'FX:USDCAD' }
    ]
  },
  {
    key: 'crypto',
    label: 'Crypto',
    symbols: [
      { label: 'BTC/USD', value: 'BITSTAMP:BTCUSD' },
      { label: 'ETH/USD', value: 'BITSTAMP:ETHUSD' },
      { label: 'SOL/USD', value: 'FTX:SOLUSD' },
      { label: 'BNB/USDT', value: 'BINANCE:BNBUSDT' }
    ]
  },
  {
    key: 'stocks',
    label: 'Stocks',
    symbols: [
      { label: 'AAPL', value: 'NASDAQ:AAPL' },
      { label: 'TSLA', value: 'NASDAQ:TSLA' },
      { label: 'NVDA', value: 'NASDAQ:NVDA' },
      { label: 'MSFT', value: 'NASDAQ:MSFT' }
    ]
  },
  {
    key: 'indices',
    label: 'Indices',
    symbols: [
      { label: 'S&P 500', value: 'TVC:SPX' },
      { label: 'NASDAQ 100', value: 'CME_MINI:NQ1!' },
      { label: 'Dow Jones', value: 'TVC:DJI' },
      { label: 'DAX', value: 'XETR:DAX' }
    ]
  },
  {
    key: 'commodities',
    label: 'Commodities',
    symbols: [
      { label: 'WTI Crude', value: 'NYMEX:CL1!' },
      { label: 'Brent Crude', value: 'TVC:UKOIL' },
      { label: 'Silver', value: 'OANDA:XAGUSD' },
      { label: 'Copper', value: 'COMEX:HG1!' }
    ]
  }
];

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);
  const [activeClassKey, setActiveClassKey] = useState<string>(ASSET_CLASSES[0].key);
  const [selectedSymbol, setSelectedSymbol] = useState<AssetSymbol>(ASSET_CLASSES[0].symbols[0]);

  const activeClass = useMemo(() => {
    return ASSET_CLASSES.find((cls) => cls.key === activeClassKey) ?? ASSET_CLASSES[0];
  }, [activeClassKey]);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.style.height = 'calc(100% - 32px)';
    widgetContainer.style.width = '100%';
    container.current.appendChild(widgetContainer);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify(
      {
        allow_symbol_change: true,
        calendar: false,
        details: true,
        hide_side_toolbar: false,
        hide_top_toolbar: false,
        hide_legend: false,
        hide_volume: false,
        hotlist: true,
        interval: 'D',
        locale: 'en',
        save_image: true,
        style: '1',
        symbol: selectedSymbol.value,
        theme: 'dark',
        timezone: 'Etc/UTC',
        backgroundColor: '#0F0F0F',
        gridColor: 'rgba(242, 242, 242, 0.06)',
        watchlist: activeClass.symbols.map((symbol) => symbol.value),
        withdateranges: true,
        compareSymbols: [],
        studies: [],
        autosize: true
      },
      null,
      2
    );
    container.current.appendChild(script);

    const copyright = document.createElement('div');
    copyright.className = 'tradingview-widget-copyright text-xs text-gray-400 mt-2';
    copyright.innerHTML =
      'The TradingView widget is for visual purposes only and may show delayed data. Final analysis uses real-time data and imagery for accuracy.';
    container.current.appendChild(copyright);
  }, [activeClass.symbols, selectedSymbol]);

  const handleAssetClassSelect = (key: string) => {
    setActiveClassKey(key);
    const nextClass = ASSET_CLASSES.find((cls) => cls.key === key);
    if (nextClass?.symbols?.length) {
      setSelectedSymbol(nextClass.symbols[0]);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-[#12121a] p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gray-400">
            <span>1 • Select Asset Class</span>
            <span className="text-[10px] text-gray-500">Live presets</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ASSET_CLASSES.map((assetClass) => {
              const isActive = assetClass.key === activeClassKey;
              return (
                <button
                  key={assetClass.key}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#2b2413] via-[#3b2f17] to-[#4a3719] text-[#f9e8b5] shadow-[0_0_25px_rgba(250,204,21,0.35)] border border-[#eab308]/60'
                      : 'border border-white/5 bg-black/30 text-gray-200 hover:border-[#f5d565]/40 hover:text-[#f5d565]'
                  }`}
                  onClick={() => handleAssetClassSelect(assetClass.key)}
                >
                  {assetClass.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#12121a] p-4 shadow-lg">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-400">
            <span>2 • Select Symbol</span>
            <span className="text-[10px] normal-case tracking-normal text-gray-500">
              {activeClass.label} focus
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeClass.symbols.map((symbol) => {
              const isSelected = selectedSymbol.value === symbol.value;
              return (
                <button
                  key={symbol.value}
                  className={`rounded-xl px-4 py-2 text-sm transition-all ${
                    isSelected
                      ? 'border border-[#facc15]/70 bg-gradient-to-br from-[#1c1407] to-[#2a1f0a] text-[#ffe9a3] shadow-[0_0_18px_rgba(250,204,21,0.4)]'
                      : 'border border-white/5 bg-black/40 text-gray-300 hover:border-[#facc15]/40 hover:text-[#facc15]'
                  }`}
                  onClick={() => setSelectedSymbol(symbol)}
                >
                  {symbol.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-white/5 bg-[#0b0b12] p-2">
        <div
          className="tradingview-widget-container h-full w-full rounded-xl bg-[#0f0f0f]"
          ref={container}
        />
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
