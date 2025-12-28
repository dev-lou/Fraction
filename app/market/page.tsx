import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import MarketList from '@/components/MarketList';
import MarketHighlights from '@/components/MarketHighlights';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-space' });
const jetBrains = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-jetbrains' });

export const revalidate = 60; // revalidate every 60s

export default async function MarketPage() {
  // Server-side fetch needs an absolute URL when calling internal API routes.
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const endpoint = new URL(`/api/market/markets?per_page=100&page=1`, origin).toString();

  const res = await fetch(endpoint, { next: { revalidate: 60 } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'failed' }));
    console.error('Market page: proxy fetch failed', res.status, body);
    const markets: any[] = [];
    return (
      <main className="min-h-screen bg-[#0a0a0a] py-12 text-neutral-100">
        <div className="mx-auto w-full max-w-full px-6 sm:px-8 lg:px-10">
          <header className="mb-6">
            <h1 className={`${spaceGrotesk.className} text-3xl font-bold text-neutral-50`}>Market — Tokens</h1>
            <p className={`${jetBrains.className} text-sm text-neutral-400 mt-1`}>Live prices (CoinGecko) · Top 100 by market cap · updated every minute</p>
          </header>

          <p className="rounded-md border border-red-600 bg-red-900/30 p-4 text-sm text-red-300">Market data is temporarily unavailable. Try again in a moment.</p>
        </div>
      </main>
    );
  }

  const markets = await res.json();

  return (
    <main className="min-h-screen bg-[#0a0a0a] py-12 text-neutral-100">
      <div className="mx-auto w-full max-w-full px-6 sm:px-8 lg:px-10">
        <header className="mb-6">
          <h1 className={`${spaceGrotesk.className} text-3xl font-bold text-neutral-50`}>Market — Tokens</h1>
          <p className={`${jetBrains.className} text-sm text-neutral-400 mt-1`}>Live prices (CoinGecko) · Top 100 by market cap · updated every minute</p>
        </header>

        <MarketHighlights markets={markets} />

        <div className="mt-6">
          <MarketList markets={markets} />
        </div>
      </div>
    </main>
  );
}
