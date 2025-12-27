'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useMemo, useState, useEffect } from 'react';
import { WagmiProvider, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';

const wagmiConfig = getDefaultConfig({
  appName: 'Fraction',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'missing-walletconnect-id',
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_ALCHEMY_ID
        ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
        : undefined,
    ),
  },
  ssr: false,
});

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);
  const theme = useMemo(
    () =>
      darkTheme({
        accentColor: '#ccff00',
        accentColorForeground: '#0a0a0a',
        borderRadius: 'medium',
        overlayBlur: 'small',
      }),
    [],
  );

  // Defer mounting Wagmi/RainbowKit until after hydration to avoid
  // "Cannot update a component while rendering a different component"
  // errors caused by modal or wallet state updates during React Query hydration.
  useEffect(() => setMounted(true), []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        {mounted ? (
          <RainbowKitProvider theme={theme}>{children}</RainbowKitProvider>
        ) : (
          // Render children without RainbowKit during initial hydration so
          // ConnectModal (which may update state during render) doesn't fire.
          <>{children}</>
        )}
      </WagmiProvider>
    </QueryClientProvider>
  );
}
