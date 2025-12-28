'use client';

import PortfolioInner from './PortfolioInner';
import { useAccount } from 'wagmi';

export default function PortfolioWithAddress() {
  const { isConnected, address } = useAccount();
  const ownerAddress = (isConnected && address) ? address.toLowerCase() : undefined;
  const ownerKey = ownerAddress;

  if (!isConnected || !ownerKey) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] py-12 text-neutral-100">
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-3xl font-semibold text-neutral-50">Portfolio</h1>
          <p className="text-sm text-neutral-400">Connect your wallet to view your portfolio.</p>
        </div>
      </main>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6" />

      <PortfolioInner ownerKey={ownerKey} />
    </div>
  );
}
