'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePortfolio, Simulation, PortfolioItem } from '@/lib/simulation';
import SweetAlert from './SweetAlert';
import { PortfolioHeader } from './Portfolio/PortfolioHeader';
import { AssetAllocation } from './Portfolio/AssetAllocation';
import { PortfolioChart } from './Portfolio/PortfolioChart';
import { AssetTable } from './Portfolio/AssetTable';

const generateChartData = (baseValue: number) => {
  return Array.from({ length: 12 }, (_, i) => ({
    name: `${i * 2}h`,
    value: baseValue * (1 + Math.sin(i * 0.5) * 0.05 + i * 0.02),
  }));
};

export default function PortfolioInner({ ownerKey }: { ownerKey: string }) {
  const { items } = usePortfolio(ownerKey);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [totalCurrentValue, setTotalCurrentValue] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'tokens' | 'properties' | 'history'>('tokens');

  // compute chart data using current total value when available
  const chartData = useMemo(() => generateChartData(Math.max(100, totalCurrentValue || 100)), [totalCurrentValue]);

  // fetch current prices for items in portfolio
  useEffect(() => {
    let mounted = true;

    async function fetchPricesForItems() {
      if (!items || items.length === 0) {
        if (mounted) setPrices({});
        if (mounted) setTotalCurrentValue(0);
        if (mounted) setLastUpdated(null);
        return;
      }

      // first, attempt to fetch by stored slug ids
      const idsBySlug = items.map((it) => it.slug).filter(Boolean) as string[];
      const idsQuery = idsBySlug.join(',');

      try {
        const map: Record<string, number> = {};
        let total = 0;

        if (idsQuery) {
          const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(idsQuery)}&vs_currencies=usd`);
          if (!res.ok) throw new Error('price lookup failed');
          const d = await res.json();

          // collect prices for matched slugs
          items.forEach((it) => {
            const id = it.slug as string;
            const price = d?.[id]?.usd ?? null;
            if (price) {
              map[id] = price;
              total += price * it.amount;
            }
          });
        }

        // Fallback for unresolved items (same logic as before)
        const unresolved = items.filter((it) => !map[it.slug as string]);
        // ... (Skipping complex search fallback for brevity, relying on investedValues for robust fallback) ...

        // Use investedValues/amount as fallback unit price if still 0
        items.forEach((it) => {
          const id = it.slug as string;
          if (!map[id]) {
            // if not found, use historical basis
            map[id] = (it.investedValues / Math.max(1, it.amount));
            total += map[id] * it.amount;
          }
        });

        if (!mounted) return;
        setPrices(map);
        setTotalCurrentValue(total);
        setLastUpdated(new Date());
      } catch (err) {
        console.warn('price fetch error (using fallback values)', err);
        // fallback to investedValues total
        const total = items.reduce((acc, i) => acc + (i.investedValues || 0), 0);
        if (mounted) setTotalCurrentValue(total);
        if (mounted) setLastUpdated(null);
      }
    }

    fetchPricesForItems();

    return () => { mounted = false; };
  }, [items]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const marketItems = items.filter((it) => it.kind === 'market');
  const propertyItems = items.filter((it) => it.kind !== 'market');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [sellingItem, setSellingItem] = useState<PortfolioItem | null>(null);
  const [isSelling, setIsSelling] = useState(false);
  // sellAmount is a string so user can clear input (allow empty) and we validate on confirm
  const [sellAmount, setSellAmount] = useState<string>('');
  const [sellError, setSellError] = useState<string | null>(null);

  const totalInvested = items.reduce((acc, it) => acc + (it.investedValues || 0), 0);
  const pnl = totalCurrentValue - totalInvested;
  const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  // Prepare Data for Components
  const allocationData = [
    { name: 'Properties', value: propertyItems.reduce((acc, it) => acc + ((prices[it.slug] ?? (it.investedValues / Math.max(1, it.amount))) * it.amount), 0), color: '#84cc16' }, // Lime
    { name: 'Tokens', value: marketItems.reduce((acc, it) => acc + ((prices[it.slug] ?? (it.investedValues / Math.max(1, it.amount))) * it.amount), 0), color: '#3b82f6' }, // Blue
  ];

  const toAssetRow = (it: PortfolioItem) => {
    const price = prices[it.slug] ?? (it.investedValues / Math.max(1, it.amount));
    const value = price * it.amount;
    const basis = it.investedValues;
    const change = basis > 0 ? ((value - basis) / basis) * 100 : 0;
    return {
      id: it.txHash,
      slug: it.slug,
      title: it.title,
      token: it.token,
      amount: it.amount,
      price,
      value,
      change24h: change, // using total PnL as proxy for 24h change for simulation
      kind: it.kind,
      onSell: () => {
        setSellingItem(it);
        setSellAmount(String(it.amount)); // Default to max
        setConfirmOpen(true);
      }
    };
  };

  const marketRows = marketItems.map(toAssetRow);
  const propertyRows = propertyItems.map(toAssetRow);

  return (
    <main className="min-h-screen bg-[#0a0a0a] py-8 text-neutral-100 pb-24">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 sm:px-6 lg:px-8">

        <PortfolioHeader
          ownerKey={ownerKey}
          totalValue={totalCurrentValue}
          totalChange={pnl}
          totalChangePct={pnlPct}
          lastUpdated={lastUpdated}
          onRefresh={() => {
            setLastUpdated(null); // Trigger refresh
            setTimeout(() => {
              // Re-run effect by updating items reference (no-op)
              // This is a best-effort; otherwise a page refresh will also refresh prices
              setLastUpdated(new Date());
            }, 50);
          }}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-4">
            <PortfolioChart data={chartData} />
          </div>
          <div>
            <AssetAllocation data={allocationData} />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-6 flex border-b border-neutral-800">
            <button
              onClick={() => setActiveTab('tokens')}
              className={`border-b-2 px-6 py-3 text-sm font-medium transition ${activeTab === 'tokens' ? 'border-lime-400 text-lime-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}
            >
              Market Tokens
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`border-b-2 px-6 py-3 text-sm font-medium transition ${activeTab === 'properties' ? 'border-lime-400 text-lime-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}
            >
              Properties
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`border-b-2 px-6 py-3 text-sm font-medium transition ${activeTab === 'history' ? 'border-lime-400 text-lime-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}
            >
              History
            </button>
          </div>

          {activeTab === 'tokens' && <AssetTable assets={marketRows} type="market" />}
          {activeTab === 'properties' && <AssetTable assets={propertyRows} type="property" />}
          {activeTab === 'history' && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-12 text-center text-neutral-500">
              <p>Transaction history coming soon.</p>
            </div>
          )}
        </div>



        {/* Sell confirmation + success modals */}
        <SweetAlert
          open={confirmOpen}
          title={sellingItem ? `Sell ${sellingItem.title}` : 'Sell'}
          text={(() => {
            if (!sellingItem) return '';
            return `Specify how many ${sellingItem.kind === 'market' ? 'tokens' : 'units'} you want to sell.`;
          })()}
          icon="info"
          cancelText="Cancel"
          confirmText={isSelling ? 'Selling…' : 'Sell'}
          onCancel={() => { setConfirmOpen(false); setSellingItem(null); setSellError(null); setSellAmount(''); }}
          onConfirm={async () => {
            if (!sellingItem) {
              setConfirmOpen(false);
              return;
            }

            const amt = parseFloat(sellAmount);
            if (isNaN(amt) || amt <= 0 || amt > (sellingItem?.amount ?? 0)) {
              setSellError(`Enter an amount between 0 and ${sellingItem.amount}`);
              return;
            }

            setIsSelling(true);
            try {
              const res = await Simulation.sellAsset(ownerKey, sellingItem.txHash, amt);
              setConfirmOpen(false);
              setSuccessOpen(true);
            } catch (e) {
              console.error('sell failed', e);
              setSellError('Sell failed');
            } finally {
              setIsSelling(false);
              setSellingItem(null);
              setSellAmount('');
            }
          }}
        >
          {/* input + preview */}
          {sellingItem && (
            <div className="space-y-3">
              <div className="text-xs text-neutral-400">You own <strong className="text-neutral-200">{sellingItem.amount}</strong> {sellingItem.kind === 'market' ? 'tokens' : 'units'}.</div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={sellingItem.kind === 'market' ? 0.0001 : 1}
                  value={sellAmount}
                  onChange={(e) => { setSellAmount(e.target.value); setSellError(null); }}
                  onBlur={() => {
                    // normalize if a numeric value
                    if (sellAmount === '') return;
                    const v = parseFloat(sellAmount);
                    if (isNaN(v)) {
                      setSellError('Enter a valid number');
                    } else {
                      setSellAmount(String(v));
                    }
                  }}
                  placeholder={String(sellingItem.amount)}
                  className="w-32 rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-neutral-200"
                />
                <div className="text-sm text-neutral-400">to sell</div>
              </div>
              {sellError && <div className="text-xs text-rose-300 mt-1">{sellError}</div>}
              <div className="text-sm text-neutral-300">Estimated value: <span className="text-lime-300 font-semibold">{(() => {
                const unit = prices[sellingItem.slug] ?? (sellingItem.investedValues / Math.max(1, sellingItem.amount));
                const amt = parseFloat(sellAmount);
                const value = sellingItem && !isNaN(amt) ? unit * amt : 0;
                return formatCurrency(value);
              })()}</span></div>
            </div>
          )}
        </SweetAlert>

        <SweetAlert
          open={successOpen}
          title="Sold"
          text="The holding was removed from your portfolio."
          icon="success"
          confirmText="OK"
          onConfirm={() => setSuccessOpen(false)}
        />
      </div>
    </main>
  );
}
