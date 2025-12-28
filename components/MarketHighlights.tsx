'use client';

import { useMemo } from 'react';
import { JetBrains_Mono } from 'next/font/google';

const jet = JetBrains_Mono({ subsets: ['latin'], display: 'swap' });

export default function MarketHighlights({ markets }: { markets: any[] }) {
  const totals = useMemo(() => {
    const marketCap = markets.reduce((acc, m) => acc + (m.market_cap || 0), 0);
    const volume = markets.reduce((acc, m) => acc + (m.total_volume || 0), 0);
    return { marketCap, volume };
  }, [markets]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-center rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
      <div>
        <div className="text-sm text-neutral-400">Total Market Cap</div>
        <div className={`${jet.className} text-2xl font-semibold text-neutral-100`}>${totals.marketCap.toLocaleString()}</div>
      </div>

      <div>
        <div className="text-sm text-neutral-400">24h Volume</div>
        <div className={`${jet.className} text-2xl font-semibold text-neutral-100`}>${totals.volume.toLocaleString()}</div>
      </div>

      <div className="text-right">
        <div className="text-sm text-neutral-400">Updated</div>
        <div className={`${jet.className} text-sm text-neutral-300`}>Live (revalidates periodically)</div>
      </div>
    </div>
  );
}
