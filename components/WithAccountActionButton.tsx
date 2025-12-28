'use client';

import { useContext } from 'react';
import { WagmiMountedContext } from './Providers';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export default function WithAccountActionButton({
  isActionable,
  onInvest,
  statusText,
  disabled,
}: {
  isActionable: boolean;
  onInvest?: () => void;
  statusText?: { comingSoon: string; soldOut: string };
  disabled?: boolean;
}) {
  const wagmiMounted = useContext(WagmiMountedContext);

  if (!wagmiMounted) {
    // Wagmi not ready — render an inert button with same visuals to avoid hook errors.
    const label = isActionable ? 'Connect to Invest' : (statusText?.comingSoon ?? 'Notify me');
    return (
      <button
        className={`rounded-full px-3 py-2 text-[12px] font-semibold transition ${isActionable
          ? 'bg-lime-300 text-[#0a0a0a]'
          : 'border border-neutral-800 text-neutral-400 cursor-not-allowed opacity-70'}`}
        disabled={!isActionable || !!disabled}
      >
        {label}
      </button>
    );
  }

  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isActionable) return;
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    onInvest?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`rounded-full px-3 py-2 text-[12px] font-semibold transition ${isActionable
        ? 'bg-lime-300 text-[#0a0a0a] hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(120,255,120,0.35)]'
        : 'border border-neutral-800 text-neutral-400 cursor-not-allowed opacity-70'}`}
      disabled={!isActionable || !!disabled}
    >
      {isActionable ? (isConnected ? 'Invest' : 'Connect to Invest') : (statusText?.comingSoon ?? 'Notify me')}
    </button>
  );
}
