'use client';

import { useEffect, useMemo, useState } from 'react';
// framer-motion removed from this modal to simplify dev compile time and avoid parsing issues

import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { type Property } from '@/lib/properties';
import { useAccount } from 'wagmi';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

interface InvestModalProps {
    property: Property | null;
    onClose: () => void;
    onSuccess?: (amount: number) => void;
    registryAddress: `0x${string}`;
}

export function InvestModal({ property, onClose, onSuccess, registryAddress }: InvestModalProps) {
    // quantity stored as string so user can clear and type freely; validated before action
    const [quantityStr, setQuantityStr] = useState<string>('1');
    const quantity = Number(quantityStr.replace(/,/g, '')) || 0;

    const [token, setToken] = useState<'ETH' | 'BTC' | 'USDC'>('ETH');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0); // 0-100 for loading bar
    const [error, setError] = useState<string | null>(null);
    const [qtyError, setQtyError] = useState<string | null>(null);
    const [rates, setRates] = useState<Record<string, { usd: number }> | null>(null);
    const [ratesError, setRatesError] = useState<string | null>(null);

    const { address, isConnected } = useAccount();

    const formatNumber = (num: number) => num.toLocaleString('en-US');
    const parseNumber = (str: string) => Number(str.replace(/,/g, ''));

    // fetch rates with caching to minimize requests
    useEffect(() => {
        let mounted = true;
        const cacheKey = 'cg_rates_v1';
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                // TTL 5 minutes
                if (Date.now() - parsed.ts < 1000 * 60 * 5) {
                    setRates(parsed.rates);
                    return;
                }
            }
        } catch { }

        (async () => {
            try {
                const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,usd-coin&vs_currencies=usd');
                if (!res.ok) throw new Error(`price fetch failed: ${res.status}`);
                const data = await res.json();
                const mapping = {
                    ETH: data.ethereum,
                    BTC: data.bitcoin,
                    USDC: data['usd-coin'],
                } as Record<'ETH' | 'BTC' | 'USDC', { usd: number }>;
                if (!mounted) return;
                setRates(mapping);
                try { sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), rates: mapping })); } catch { }
            } catch (err: any) {
                console.warn('price fetch error (using bad network fallback)', err);
                // Fallback rates if API fails (e.g. adblocker, rate limit)
                const fallback = {
                    ETH: { usd: 3500 },
                    BTC: { usd: 65000 },
                    USDC: { usd: 1 },
                };
                if (mounted) setRates(fallback);
                setRatesError(null); // Clear error since we have fallback
            }
        })();
        return () => { mounted = false; };
    }, []);

    const tokenPriceUSD = useMemo(() => {
        if (!property) return 0;
        // property.tokenPrice like '$1.08'
        const val = Number(String(property.tokenPrice).replace(/[^0-9.\-]/g, ''));
        return Number.isFinite(val) ? val : 1;
    }, [property]);

    const currencyRateUSD = useMemo(() => {
        return rates?.[token]?.usd ?? null;
    }, [rates, token]);

    const pricePerTokenInCurrency = useMemo(() => {
        if (!currencyRateUSD) return null;
        return tokenPriceUSD / currencyRateUSD;
    }, [tokenPriceUSD, currencyRateUSD]);

    // validation helpers
    const availableCount = property ? (Number(property.available) || 0) : 0;
    const isQtyValid = quantity > 0 && quantity <= availableCount;

    const totalCostCurrency = useMemo(() => {
        return pricePerTokenInCurrency ? quantity * pricePerTokenInCurrency : null;
    }, [quantity, pricePerTokenInCurrency]);

    if (!property) return null;

    // Price is computed from property USD tokenPrice and live currency rates
    const totalCost = totalCostCurrency;

    const currencyAmount = totalCost ?? null; // amount in selected token
    const investedUSD = tokenPriceUSD * quantity;

    // validate quantity for enabling button
    const qtyValid = quantity > 0 && quantity <= availableCount;

    const handleInvest = async () => {
        console.log('[InvestModal] handleInvest start', { address, isConnected, pricePerTokenInCurrency, quantity });
        if (!isConnected || !address) {
            setError('Connect a wallet to invest.');
            return;
        }
        if (!pricePerTokenInCurrency) {
            setError('Waiting for price data. Try again in a moment.');
            return;
        }
        setIsProcessing(true);
        setError(null);
        // kick off a progress animation while the simulated invest runs
        setProgress(6);
        let iv: any = null;
        iv = setInterval(() => {
            setProgress((p) => Math.min(90, p + Math.random() * 12 + 4));
        }, 300);
        try {
            const { Simulation } = await import('@/lib/simulation');
            const res = await Simulation.invest(address, { ...property, tokenPrice: tokenPriceUSD }, quantity, token, currencyAmount, investedUSD, 'property');

            // finish progress and wait briefly so the user sees it reach 100%
            setProgress(100);
            // stop progress interval immediately
            clearInterval(iv);
            // give progress bar time to animate to 100%
            await new Promise((r) => setTimeout(r, 600));

            // Notify parent immediately (which closes modal and opens sweet alert)
            onSuccess?.(quantity);

        } catch (err: any) {
            console.error('Simulation.invest failed', err);
            setError(err?.message || 'Investment failed. Please try again.');
        } finally {
            clearInterval(iv);
            setIsProcessing(false);
            setTimeout(() => setProgress(0), 400);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-3xl border border-neutral-800 bg-[#0a0a0a] p-8 shadow-2xl overflow-hidden relative">
                {/* Background Gradient */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />

                <div>
                    <div className="space-y-1 mb-6">
                        <h2 className={`${spaceGrotesk.className} text-xl font-bold text-neutral-50`}>Invest in {property.title}</h2>
                        <p className={`${jetBrainsMono.className} text-xs text-neutral-500`}>{property.city} • Available: {property.available}</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-2">Quantity</label>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setQuantityStr(String(Math.max(1, Math.floor(quantity - 1))))} className="h-9 w-9 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-300 hover:bg-neutral-800" disabled={isProcessing}>-</button>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={quantityStr}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                            if (!val) {
                                                setQuantityStr('');
                                                setQtyError(null);
                                                return;
                                            }
                                            const num = Number(val);
                                            if (Number.isFinite(num)) {
                                                setQuantityStr(formatNumber(num));
                                                setQtyError(null);
                                            }
                                        }}
                                        onBlur={() => {
                                            const v = parseNumber(quantityStr);
                                            if (quantityStr === '') return;
                                            if (!Number.isFinite(v) || v <= 0) {
                                                setQtyError('Enter a valid quantity');
                                                setQuantityStr('');
                                            } else {
                                                // Max limit check on blur or change? Let's cap max on blur to available
                                                const max = Number(property.available) || 999999;
                                                if (v > max) {
                                                    setQuantityStr(formatNumber(max));
                                                } else {
                                                    setQuantityStr(formatNumber(Math.floor(v)));
                                                }
                                            }
                                        }}
                                        className={`${jetBrainsMono.className} text-2xl font-bold text-neutral-100 bg-transparent text-center w-40 rounded-md border border-neutral-800 px-2 py-1`}
                                        disabled={isProcessing}
                                    />
                                    <button onClick={() => setQuantityStr(formatNumber(Math.min(Number(property.available) || 999999, Math.floor(quantity + 1))))} className="h-9 w-9 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-300 hover:bg-neutral-800" disabled={isProcessing}>+</button>
                                </div>

                                <div className="flex items-center gap-2">
                                    {[25, 50, 100].map((p) => (
                                        <button key={p} onClick={() => setQuantityStr(formatNumber(Math.max(1, Math.floor((availableCount * p) / 100))))} className={`rounded-full px-3 py-1 text-xs ${Math.floor(quantity) === Math.floor((availableCount * p) / 100) ? 'bg-lime-400 text-black' : 'border border-neutral-800 text-neutral-200'}`}>{p}%</button>
                                    ))}
                                    <button onClick={() => setQuantityStr(formatNumber(availableCount))} className="rounded-full px-3 py-1 text-xs border border-neutral-800 text-neutral-200">Max</button>
                                </div>
                            </div>

                            {qtyError && <div className="text-xs text-rose-300 mt-2">{qtyError}</div>}
                            <div className="text-xs text-neutral-400 mt-1">Available: {property.available}</div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-2">Pay with</label>
                                <div className="flex gap-2">
                                    {(['ETH', 'BTC', 'USDC'] as const).map((t) => (
                                        <button key={t} onClick={() => setToken(t)} disabled={isProcessing} className={`flex-1 rounded-full border px-3 py-2 text-sm font-semibold transition ${token === t ? 'border-lime-300/80 bg-lime-300/10 text-lime-200' : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'}`}>{t}</button>
                                    ))}
                                </div>
                                {ratesError && <p className="mt-2 text-xs text-red-400">Price lookup failed: {ratesError}</p>}
                            </div>

                            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-neutral-400">Price per Token</span><span className={`${jetBrainsMono.className} text-neutral-200`}>{pricePerTokenInCurrency ? pricePerTokenInCurrency.toFixed(6) : '...'} {token}</span></div>
                                <div className="h-px bg-neutral-800" />
                                <div className="flex justify-between text-base font-semibold"><span className="text-neutral-200">Total</span><span className={`${jetBrainsMono.className} text-lime-300`}>{totalCost ? totalCost.toFixed(6) : '...'} {token}</span></div>
                                <div className="flex justify-between text-xs text-neutral-400"><span>USD</span><span className={`${jetBrainsMono.className} text-neutral-200`}>${(tokenPriceUSD * quantity).toFixed(2)}</span></div>
                            </div>
                        </div>

                        {error && (
                            <p className="text-xs text-red-400 bg-red-400/10 p-2 rounded-lg">{error}</p>
                        )}

                        {/* Loading progress bar (subtle) */}
                        {isProcessing && (
                            <div className="mt-4 w-full rounded-full bg-neutral-900/40 h-2 overflow-hidden">
                                <div className="h-2 bg-lime-400 transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button onClick={onClose} disabled={isProcessing} className="flex-1 rounded-full border border-neutral-800 py-3 text-sm font-semibold text-neutral-300 hover:bg-neutral-900 disabled:opacity-50">Cancel</button>
                            <button onClick={handleInvest} disabled={isProcessing || !isConnected || !pricePerTokenInCurrency || !qtyValid} className="flex-1 rounded-full bg-lime-400 py-3 text-sm font-semibold text-black hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed">{isProcessing ? 'Processing...' : !isConnected ? 'Connect wallet' : !pricePerTokenInCurrency ? 'Loading prices…' : (!qtyValid ? 'Invalid quantity' : 'Confirm Invest')}</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

