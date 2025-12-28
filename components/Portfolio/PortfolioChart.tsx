'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

interface PortfolioChartProps {
    data: { name: string; value: number }[];
}

export function PortfolioChart({ data }: PortfolioChartProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="h-full rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
            <div className="mb-6 flex items-center justify-between">
                <h3 className={`${spaceGrotesk.className} text-lg font-semibold text-neutral-50`}>Performance</h3>
                <div className="flex gap-2">
                    {['1D', '1W', '1M', '1Y', 'ALL'].map((tf) => (
                        <button
                            key={tf}
                            className={`rounded-lg px-3 py-1 text-xs font-medium transition ${tf === '1M' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="chartInfo" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#525252"
                            tick={{ fill: '#737373', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#525252"
                            tick={{ fill: '#737373', fontSize: 11 }}
                            tickFormatter={(value) => `$${value}`}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '0.5rem' }}
                            itemStyle={{ color: '#84cc16' }}
                            formatter={(value: any) => [formatCurrency(value), 'Value']}
                            labelStyle={{ color: '#a3a3a3', marginBottom: '0.25rem' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#84cc16"
                            strokeWidth={2}
                            fill="url(#chartInfo)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
