'use client';

import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import Image from 'next/image';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

interface AssetItem {
    id: string;
    slug: string;
    title: string;
    token: string; // symbol
    amount: number;
    price: number;
    value: number;
    change24h: number; // percentage
    onSell: () => void;
    kind?: 'property' | 'market';
}

interface AssetTableProps {
    assets: AssetItem[];
    type: 'market' | 'property';
}

export function AssetTable({ assets, type }: AssetTableProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    if (assets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 rounded-full bg-neutral-900 p-4 ring-1 ring-inset ring-neutral-800">
                    <span className="text-2xl">👻</span>
                </div>
                <p className="text-neutral-400">No {type === 'market' ? 'tokens' : 'properties'} found.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-900/80 text-xs font-medium uppercase text-neutral-500">
                        <tr>
                            <th className="px-6 py-4">Asset</th>
                            <th className="px-6 py-4 text-right">Price</th>
                            <th className="px-6 py-4 text-right">Balance</th>
                            <th className="px-6 py-4 text-right">Value</th>
                            <th className="px-6 py-4 text-right">24h Change</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/50">
                        {assets.map((asset) => (
                            <tr key={asset.id} className="group transition hover:bg-neutral-900/60">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 ${type === 'market' ? 'bg-lime-900/20 text-lime-400' : 'bg-indigo-900/20 text-indigo-400'}`}>
                                            {/* Placeholder icon based on type */}
                                            {type === 'market' ? '🪙' : '🏢'}
                                        </div>
                                        <div>
                                            <div className={`${spaceGrotesk.className} font-semibold text-neutral-200`}>{asset.title}</div>
                                            <div className="text-xs text-neutral-500">{asset.token}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right text-neutral-300">
                                    <span className={jetBrainsMono.className}>{formatCurrency(asset.price)}</span>
                                </td>
                                <td className="px-6 py-4 text-right text-neutral-300">
                                    <div className={jetBrainsMono.className}>{asset.amount.toLocaleString()}</div>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-neutral-100">
                                    <span className={jetBrainsMono.className}>{formatCurrency(asset.value)}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className={`${jetBrainsMono.className} ${asset.change24h >= 0 ? 'text-lime-400' : 'text-rose-400'}`}>
                                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={asset.onSell}
                                        className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-400 opacity-0 transition hover:border-neutral-700 hover:text-neutral-200 group-hover:opacity-100"
                                    >
                                        Sell
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
