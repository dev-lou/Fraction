'use client';

import { useState, useEffect } from 'react';

export type PortfolioItem = {
    slug: string;
    title: string;
    amount: number; // Number of tokens
    investedValues: number; // Total USD value at time of investment (fake)
    timestamp: number;
    token: string; // token symbol or currency
    txHash: string;
    currencySpent?: number; // amount spent in selected crypto (e.g., ETH)
    kind?: 'property' | 'market';
};

const STORAGE_KEY = 'fraction_portfolio_v1';

type PortfolioStore = Record<string, PortfolioItem[]>; // keyed by wallet address

// Internal event bus for reactivity
const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function readStore(): PortfolioStore {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (err: any) {
        console.error('readStore failed', err);
        return {};
    }
}

function writeStore(store: PortfolioStore) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (err: any) {
        console.error('writeStore failed', err);
        throw new Error('Unable to persist simulation data');
    }
}

function randomHash() {
    const bytes = crypto?.getRandomValues?.(new Uint8Array(32)) || Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
    return '0x' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export const Simulation = {
    getPortfolio: (address?: string): PortfolioItem[] => {
        if (!address) return [];
        const store = readStore();
        return store[address.toLowerCase()] || [];
    },

    invest: async (
        address: string | undefined,
        property: { title: string; slug?: string; tokenPrice?: number; current_price?: number; id?: string },
        quantity: number,
        token: 'ETH' | 'BTC' | 'USDC' | 'USD',
        currencyAmount?: number | null,
        investedUSD?: number | null,
        kind: 'property' | 'market' = 'property',
    ): Promise<PortfolioItem> => {
        const portfolioOwner = (address || 'guest').toLowerCase();

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 600));

        const key = portfolioOwner;
        const store = readStore();
        const current = store[key] || [];
        const slug = property.slug || property.id || property.title;
        const existing = current.find((p) => p.slug === slug);

        const tokenUsd = property.tokenPrice ?? property.current_price ?? 1;
        const invested = investedUSD ?? quantity * tokenUsd;
        const txHash = randomHash();

        if (existing) {
            existing.amount += quantity;
            existing.investedValues += invested;
            existing.timestamp = Date.now();
            existing.token = token;
            existing.txHash = txHash;
            existing.currencySpent = (existing.currencySpent || 0) + (currencyAmount ?? 0);
            existing.kind = existing.kind || kind;
        } else {
            current.push({
                slug,
                title: property.title,
                amount: quantity,
                investedValues: invested,
                timestamp: Date.now(),
                token,
                txHash,
                currencySpent: currencyAmount ?? 0,
                kind,
            });
        }

        store[key] = current;
        writeStore(store);
        notify();
        return current.find((p) => p.txHash === txHash) as PortfolioItem;
    },

    reset: (address?: string) => {
        const store = readStore();
        if (!address) {
            localStorage.removeItem(STORAGE_KEY);
        } else {
            delete store[address.toLowerCase()];
            writeStore(store);
        }
        notify();
    },

    // Remove or decrement a portfolio item by txHash for an owner. Simulates selling.
    // If `amount` is provided and less than the existing amount, this will decrement the item and
    // adjust investedValues proportionally. Otherwise it removes the item.
    sellAsset: async (address: string | undefined, txHash: string, amount?: number) => {
        const portfolioOwner = (address || 'guest').toLowerCase();
        const store = readStore();
        const current = store[portfolioOwner] || [];
        const idx = current.findIndex((p) => p.txHash === txHash);
        if (idx === -1) return null;
        const item = current[idx];
        const sellAmount = typeof amount === 'number' ? Math.max(0, Math.min(amount, item.amount)) : item.amount;

        if (sellAmount <= 0) return null;

        // If partial sell
        if (sellAmount < item.amount) {
            const remaining = item.amount - sellAmount;
            // reduce investedValues proportionally
            const fraction = remaining / item.amount;
            item.amount = remaining;
            item.investedValues = Math.round((item.investedValues || 0) * fraction * 100) / 100;
            item.timestamp = Date.now();
            item.txHash = randomHash();
            store[portfolioOwner] = current;
            writeStore(store);
            notify();
            await new Promise((r) => setTimeout(r, 200 + Math.random() * 400));
            return { sold: { ...item, amount: sellAmount }, remaining: item };
        }

        // Full sell
        const removed = current.splice(idx, 1)[0];
        store[portfolioOwner] = current;
        writeStore(store);
        notify();
        await new Promise((r) => setTimeout(r, 200 + Math.random() * 400));
        return { sold: removed, remaining: null };
    }
};

// React Hook
export function usePortfolio(address?: string) {
    const [items, setItems] = useState<PortfolioItem[]>([]);

    useEffect(() => {
        setItems(Simulation.getPortfolio(address));
        const unsub = subscribe(() => setItems(Simulation.getPortfolio(address)));
        return () => { unsub(); };
    }, [address]);

    return { items, totalValue: items.reduce((acc, i) => acc + i.investedValues, 0) };
}
