import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import MarketList from '@/components/MarketList';
import MarketHighlights from '@/components/MarketHighlights';
import { getCoinGeckoMarkets } from '@/lib/coingecko';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-space' });
const jetBrains = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-jetbrains' });

export const revalidate = 60; // revalidate every 60s

export default async function MarketPage() {
  let markets = [];

  try {
    markets = await getCoinGeckoMarkets({ per_page: '100', page: '1' });
  } catch (err) {
    console.error('Market page: fetch failed', err);
    return (
      <main className="min-h-screen bg-[#0a0a0a] py-12 text-neutral-100">
        <div className="mx-auto w-full max-w-full px-6 sm:px-8 lg:px-10">
          <header className="mb-6">
            <h1 className={`${spaceGrotesk.className} text-3xl font-bold text-neutral-50`}>Market — Tokens</h1>
            <p className={`${jetBrains.className} text-sm text-neutral-400 mt-1`}>Live prices (CoinGecko) · Top 100 by market cap · updated every minute</p>
          </header>
          <p className="rounded-md border border-red-600 bg-red-900/30 p-4 text-sm text-red-300">
            Market data is temporarily unavailable. Try again in a moment.
          </p>
        </div>
      </main>
    );
  }

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
