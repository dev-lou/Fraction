'use client';

import { useEffect, useMemo, useState } from 'react';
import { JetBrains_Mono } from 'next/font/google';
import TokenBuyModal from './TokenBuyModal';

const jetBrains = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-jetbrains' });

type Market = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume?: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h?: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
};

export default function MarketList({ markets: initialMarkets }: { markets: Market[] }) {
  const [query, setQuery] = useState('');
  const [markets, setMarkets] = useState<Market[]>(initialMarkets);
  // Default to sort by price (high → low)
  const [sortKey, setSortKey] = useState<string | null>('current_price');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [selectedCoin, setSelectedCoin] = useState<Market | null>(null);

  // No category filtering — markets come from the initial fetch and aren't refetched by category.


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = markets;
    if (q) list = list.filter((m) => m.name.toLowerCase().includes(q) || m.symbol.toLowerCase().includes(q));
    if (sortKey) {
      list = [...list].sort((a: any, b: any) => {
        const av = a[sortKey] ?? 0;
        const bv = b[sortKey] ?? 0;
        if (av === bv) return 0;
        return sortDir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
      });
    }
    return list;
  }, [markets, query, sortKey, sortDir]);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  // Shared grid template so header and rows stay perfectly aligned on md+
  const gridCols = 'md:grid-cols-[minmax(220px,2fr)_minmax(150px,1fr)_minmax(160px,1fr)_minmax(170px,1fr)_minmax(90px,auto)]';

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or symbol (e.g. BTC, ethereum)"
          className="w-full rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 focus:outline-none"
        />

      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 overflow-hidden">
        <div className={`hidden md:grid ${gridCols} items-center gap-6 px-6 py-3 text-xs text-neutral-500`}>
          <div className="flex items-center justify-start">Name</div>
          <div
            role="button"
            title="Sort by price"
            onClick={() => toggleSort('current_price')}
            className="flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            <span>Price</span>
            <span className="text-xs text-neutral-500">24h</span>
            {sortKey === 'current_price' && (
              <svg className={`h-3 w-3 text-neutral-400 ${sortDir === 'asc' ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5-5 5 5" />
              </svg>
            )}
          </div>

          <div
            role="button"
            title="Sort by market cap"
            onClick={() => toggleSort('market_cap')}
            className="text-center cursor-pointer select-none"
          >
            Market Cap
            {sortKey === 'market_cap' && (
              <svg className={`inline-block ml-2 h-3 w-3 text-neutral-400 ${sortDir === 'asc' ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5-5 5 5" />
              </svg>
            )}
          </div>
          <div className="flex items-center justify-center">Sparkline</div>
          <div className="text-center">Buy</div>
        </div>

        <div className="divide-y divide-neutral-800">
          {filtered.map((m) => (
            <div key={m.id} className={`grid grid-cols-1 ${gridCols} items-center gap-6 px-6 py-3 text-sm hover:bg-neutral-900 transition-colors`}>
              <div className="flex items-center gap-3 md:justify-start">
                <img src={m.image} alt={m.name} className="h-8 w-8 rounded-full" />
                <div className="md:text-center">
                  <div className={`${jetBrains.className} font-semibold text-neutral-100 truncate max-w-[280px]`}>{m.name}</div>
                  <div className="text-xs text-neutral-500">{m.symbol.toUpperCase()}</div>
                </div>
              </div>

              {(() => {
                const isPositive = (m.price_change_percentage_24h ?? 0) > 0;
                return (
                  <>
                    <div className="md:text-center md:min-w-[150px] flex md:justify-center">
                      <div className="flex items-center justify-start md:justify-center gap-3 md:gap-4 w-full md:w-auto">
                        <div className="font-medium text-neutral-100">${m.current_price.toLocaleString()}</div>
                        <div className={`text-sm flex items-center gap-2 ${isPositive ? 'text-lime-300' : 'text-red-400'}`}>
                          <span className="inline-flex items-center" aria-hidden>
                            {isPositive ? (
                              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12l5-5 5 5" />
                              </svg>
                            ) : (
                              <svg className="h-3 w-3 rotate-180" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12l5-5 5 5" />
                              </svg>
                            )}
                          </span>
                          <span>{m.price_change_percentage_24h ? `${m.price_change_percentage_24h.toFixed(2)}%` : '-'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-neutral-500 truncate md:min-w-[160px] md:text-center">${Number(m.market_cap).toLocaleString()}</div>

                    <div className="w-full md:w-48 flex items-center justify-center mx-auto">
                      {m.sparkline_in_7d?.price ? (
                        <div className="w-full h-8 max-w-[210px]">
                          <Sparkline data={m.sparkline_in_7d.price} positive={isPositive} />
                        </div>
                      ) : (
                        <div className="h-8" />
                      )}
                    </div>
                  </>
                );
              })() }

              <div className="mt-3 md:mt-0 md:flex md:items-center md:justify-center">
                <button onClick={() => setSelectedCoin(m)} className="rounded-full border border-neutral-800 px-3 py-1 text-sm font-semibold bg-neutral-900/60 hover:bg-neutral-900">Buy</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Token buy modal */}
      <TokenBuyModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} onBought={() => setSelectedCoin(null)} />
    </div>
  );
}

function Sparkline({ data, positive }: { data: number[]; positive?: boolean }) {
  // simple inline svg sparkline (server-friendly, tiny)
  const w = 140;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const stroke = positive ? '#ccff00' : '#ff6b6b';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none" className="block">
      <polyline points={points.join(' ')} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
