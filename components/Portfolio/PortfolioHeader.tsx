'use client';

import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

interface PortfolioHeaderProps {
    ownerKey: string;
    totalValue: number;
    totalChange: number;
    totalChangePct: number;
    lastUpdated: Date | null;
    onRefresh: () => void;
}

export function PortfolioHeader({ ownerKey, totalValue, totalChange, totalChangePct, lastUpdated, onRefresh }: PortfolioHeaderProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const formatDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

    return (
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500" />
                    <span className={jetBrainsMono.className}>{ownerKey.slice(0, 6)}...{ownerKey.slice(-4)}</span>
                </div>
                <div>
                    <h1 className={`${spaceGrotesk.className} text-4xl font-bold text-neutral-50 md:text-5xl`}>
                        {formatCurrency(totalValue)}
                    </h1>
                    <div className="mt-1 flex items-center gap-2">
                        <span className={`text-sm font-medium ${totalChange >= 0 ? 'text-lime-300' : 'text-rose-300'}`}>
                            {totalChange >= 0 ? '+' : ''}{formatCurrency(totalChange)} ({totalChangePct.toFixed(2)}%)
                        </span>
                        <span className="text-sm text-neutral-500">Today</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">{lastUpdated ? `Updated ${formatDate.format(lastUpdated)}` : 'Syncing...'}</span>
                    <button
                        onClick={onRefresh}
                        className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        </div>
    );
}
