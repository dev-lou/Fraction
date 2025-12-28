'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

interface AssetAllocationProps {
    data: { name: string; value: number; color: string }[];
}

export function AssetAllocation({ data }: AssetAllocationProps) {
    // Filter out zero values for the chart
    const activeData = data.filter(d => d.value > 0);

    if (activeData.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 text-sm text-neutral-500">
                No assets to display
            </div>
        );
    }

    return (
        <div className="h-full rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <h3 className={`${spaceGrotesk.className} mb-4 text-lg font-semibold text-neutral-50`}>Allocation</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={activeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {activeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '0.5rem', color: '#e5e5e5' }}
                            itemStyle={{ color: '#e5e5e5' }}
                            formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value: any, entry: any) => <span className="ml-2 text-xs text-neutral-400">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
