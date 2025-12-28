'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';

import SweetAlert from './SweetAlert';
import { useContext } from 'react';
import { WagmiMountedContext } from './Providers';
import WithAccountConfirmButton from './WithAccountConfirmButton';
import { useRouter } from 'next/navigation';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export type MarketRow = {
  id: string;
  symbol: string;
  name: string;
  current_price: number; // in USD
};

export default function TokenBuyModal({ coin, onClose, onBought }: { coin: MarketRow | null; onClose: () => void; onBought?: (tx: any) => void }) {
  const [quantity, setQuantity] = useState<number>(1);
  const [currency, setCurrency] = useState<'USD' | 'ETH' | 'BTC' | 'USDC'>('USD');
  const [rates, setRates] = useState<Record<string, { usd: number }> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sweetOpen, setSweetOpen] = useState(false);
  const [sweetText, setSweetText] = useState<{ title?: string; text?: string; type?: 'success'|'error'|'info' }>({ title: undefined, text: undefined, type: 'success' });
  const [lastTx, setLastTx] = useState<any>(null);

  useEffect(() => setQuantity(1), [coin]);

  // fetch rates
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,usd-coin&vs_currencies=usd');
        if (!res.ok) throw new Error('price lookup failed');
        const d = await res.json();
        if (!mounted) return;
        setRates({ ETH: d.ethereum, BTC: d.bitcoin, USDC: d['usd-coin'] });
      } catch (err: any) {
        console.error('price fetch error', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const tokenPriceUSD = coin?.current_price ?? 1;
  const currencyRateUSD = useMemo(() => (currency === 'USD' ? 1 : rates?.[currency]?.usd ?? null), [rates, currency]);
  const pricePerTokenInCurrency = useMemo(() => (currencyRateUSD ? tokenPriceUSD / currencyRateUSD : null), [tokenPriceUSD, currencyRateUSD]);
  const totalCostCurrency = useMemo(() => (pricePerTokenInCurrency ? pricePerTokenInCurrency * quantity : null), [pricePerTokenInCurrency, quantity]);

  const wagmiMounted = useContext(WagmiMountedContext);
  const router = useRouter();

  const handleConfirmWithAccount = async (address: string | undefined, isConnected: boolean | undefined) => {
    if (!coin) return;
    if (!pricePerTokenInCurrency) {
      setError('Waiting for price data');
      return;
    }

    if (!isConnected || !address) {
      setError('Connect your wallet to buy.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const res = await import('@/lib/simulation');
      const portfolioAddress = address;
      const tx = await (res.Simulation as any).invest(
        portfolioAddress,
        { title: coin.name, slug: coin.id, tokenPrice: coin.current_price, id: coin.id },
        quantity,
        currency,
        totalCostCurrency,
        tokenPriceUSD * quantity,
        'market',
      );

      setLastTx(tx);
      setSweetText({ title: 'Purchase successful', text: 'You successfully purchased this token and it has been added to your portfolio.', type: 'success' });
      setSweetOpen(true);
    } catch (err: any) {
      console.error('buy failed', err);
      setError(err?.message || 'Buy failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!coin) return null;
  if (!wagmiMounted) {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#0a0a0a] p-6 text-center space-y-4">
            <h3 className={`${spaceGrotesk.className} text-xl font-bold text-neutral-50`}>Connect your wallet</h3>
            <p className="text-sm text-neutral-400">You need to connect your wallet to purchase tokens.</p>
            <button onClick={onClose} className="w-full rounded-full border border-neutral-800 py-3 text-sm text-neutral-200">Close</button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Wagmi is mounted — use wallet state
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#0a0a0a] p-6">
          <div className="space-y-4">
            <h3 className={`${spaceGrotesk.className} text-xl font-bold text-neutral-50`}>Buy {coin.name}</h3>
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              This is a simulated buy. No blockchain transaction occurs; your purchase is stored locally for demo purposes.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-400">Quantity</label>
                <input type="number" className="mt-1 w-full rounded-md border border-neutral-800 bg-transparent px-3 py-2" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))} />
              </div>
              <div>
                <label className="block text-xs text-neutral-400">Pay in</label>
                <div className="mt-1 relative">
                  <select aria-label="Pay in" className="w-full rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2 pr-9 text-neutral-200 appearance-none focus:outline-none" value={currency} onChange={(e) => setCurrency(e.target.value as any)}>
                    <option className="bg-neutral-900 text-neutral-200" style={{backgroundColor:'#0b0b0b', color:'#e5e7eb'}}>USD</option>
                    <option className="bg-neutral-900 text-neutral-200" style={{backgroundColor:'#0b0b0b', color:'#e5e7eb'}}>ETH</option>
                    <option className="bg-neutral-900 text-neutral-200" style={{backgroundColor:'#0b0b0b', color:'#e5e7eb'}}>BTC</option>
                    <option className="bg-neutral-900 text-neutral-200" style={{backgroundColor:'#0b0b0b', color:'#e5e7eb'}}>USDC</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-neutral-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 8l4 4 4-4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Price per Token</span>
                <span className={`${jetBrainsMono.className} text-neutral-200`}>{pricePerTokenInCurrency ? pricePerTokenInCurrency.toFixed(6) : '...' } {currency}</span>
              </div>
              <div className="h-px bg-neutral-800 my-2" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className={`${jetBrainsMono.className} text-lime-300`}>{totalCostCurrency ? totalCostCurrency.toFixed(6) : '...'} {currency}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-400 mt-1">
                <span>USD</span>
                <span className={`${jetBrainsMono.className} text-neutral-200`}>${(tokenPriceUSD * quantity).toFixed(2)}</span>
              </div>
            </div>

            {error && <div className="text-xs text-red-400">{error}</div>}

<div className="relative">
              {isProcessing && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 animate-spin text-neutral-200" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <div className="text-sm text-neutral-200">Processing…</div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={onClose} disabled={isProcessing} className="flex-1 rounded-full border border-neutral-800 py-3 text-sm">Cancel</button>
                <WithAccountConfirmButton handleConfirm={handleConfirmWithAccount} disabled={isProcessing || !pricePerTokenInCurrency} />
              </div>
            </div>

            {/* sweetalert container */}
            <SweetAlert open={sweetOpen} title={sweetText.title} text={sweetText.text} icon={sweetText.type} confirmText="OK" onConfirm={() => { setSweetOpen(false); onClose(); }} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
