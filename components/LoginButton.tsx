'use client';

import { useState, useTransition } from 'react';
import { buildSiweMessage } from '@/lib/auth';
import { signInAction } from '@/lib/serverActions';
import { useAccount, useSignMessage } from 'wagmi';

function randomNonce() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

export function LoginButton() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync, isPending: signing } = useSignMessage();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'signed-in' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!address || !isConnected) return;
    setStatus('idle');
    setError(null);

    const nonce = randomNonce();
    const message = buildSiweMessage(nonce);

    try {
      const signature = await signMessageAsync({ message });
      startTransition(async () => {
        await signInAction({ address, message, signature });
        setStatus('signed-in');
      });
    } catch (err: any) {
      setStatus('error');
      setError(err?.message || 'Sign in failed');
    }
  };

  if (!isConnected) {
    return <button className="rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-400" disabled>Connect wallet to sign in</button>;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSignIn}
        disabled={isPending || signing}
        className="rounded-lg bg-lime-300 px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending || signing ? 'Signing…' : status === 'signed-in' ? 'Signed In' : 'Sign In'}
      </button>
      {status === 'error' && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
