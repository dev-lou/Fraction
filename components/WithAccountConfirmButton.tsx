'use client';

import { useAccount } from 'wagmi';

export default function WithAccountConfirmButton({ handleConfirm, disabled }: { handleConfirm: (address?: string, isConnected?: boolean) => void; disabled?: boolean }) {
  const { address, isConnected } = useAccount();
  return (
    <button onClick={() => handleConfirm(address, isConnected)} disabled={disabled} className="flex-1 rounded-full bg-lime-400 py-3 text-sm font-semibold text-black disabled:opacity-50">
      {disabled ? 'Processing...' : 'Confirm Buy'}
    </button>
  );
}
