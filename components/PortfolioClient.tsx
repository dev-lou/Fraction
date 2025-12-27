'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';

const jetBrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space', display: 'swap' });

export type InvestmentRow = {
  id: string;
  tokens: number;
  properties: {
    title: string;
    apy: number;
    token_price: number;
  } | null;
};

type Props = {
  address: string;
  rows: InvestmentRow[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
}

export function PortfolioClient({ address, rows }: Props) {
  const totalNetWorth = rows.reduce((sum, row) => {
    const price = row.properties?.token_price ?? 0;
    return sum + (row.tokens || 0) * price;
  }, 0);

  const chartData = rows.map((row, idx) => ({
    name: row.properties?.title || `Asset ${idx + 1}`,
    income: (row.tokens || 0) * ((row.properties?.apy || 0) / 100) * (row.properties?.token_price || 0) / 12,
  }));

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-12 text-neutral-100 md:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div>
          <h1 className={`${spaceGrotesk.className} text-3xl font-bold text-neutral-50`}>Your Portfolio</h1>
          <p className="text-sm text-neutral-400">Connected as {address}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
            <div className="flex items-center justify-between">
              <h2 className={`${spaceGrotesk.className} text-lg font-semibold text-neutral-50`}>Holdings</h2>
              <span className={`${jetBrains.className} text-xs text-neutral-400`}>{rows.length} assets</span>
            </div>
            <div className="divide-y divide-neutral-800/80">
              {rows.length === 0 && <p className="py-6 text-sm text-neutral-500">No investments yet.</p>}
              {rows.map((row) => (
                <div key={row.id} className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <p className={`${spaceGrotesk.className} text-base font-semibold text-neutral-50`}>
                      {row.properties?.title ?? 'Property'}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">APY {row.properties?.apy ?? 0}%</p>
                  </div>
                  <div className="text-right">
                    <p className={`${jetBrains.className} text-xl font-semibold text-lime-300`}>
                      {row.tokens} tokens
                    </p>
                    <p className="text-xs text-neutral-400">@ {formatCurrency(row.properties?.token_price ?? 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
            <div className="flex items-center justify-between">
              <h2 className={`${spaceGrotesk.className} text-lg font-semibold text-neutral-50`}>Analytics</h2>
              <span className={`${jetBrains.className} text-xs text-neutral-400`}>Projected monthly income</span>
            </div>
            <div className={`${jetBrains.className} text-4xl font-semibold text-lime-300`}>
              {formatCurrency(totalNetWorth)}
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ccff00" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#ccff00" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#444" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#444" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#0f1115', border: '1px solid #1f2937' }} />
                  <Area type="monotone" dataKey="income" stroke="#ccff00" fill="url(#income)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
