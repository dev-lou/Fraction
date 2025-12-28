'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useMemo, useState, useEffect, createContext } from 'react';

export const WagmiMountedContext = createContext(false);
import { WagmiProvider, http } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';


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

  // Build Wagmi config inside the component to avoid module-eval side-effects
  // and to ensure consistent behavior between server and client. Disable
  // Wagmi SSR to prevent client-only state from causing hydration diffs.
  const wagmiConfig = useMemo(() =>
    getDefaultConfig({
      appName: 'Fraction',
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'missing-walletconnect-id',
      chains: [hardhat, sepolia],
      transports: {
        [hardhat.id]: http('http://127.0.0.1:8545'),
        [sepolia.id]: http(
          process.env.NEXT_PUBLIC_ALCHEMY_ID
            ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
            : undefined,
        ),
      },
      ssr: false,
    }),
    []);


  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiMountedContext.Provider value={mounted}>
          <RainbowKitProvider theme={theme}>
            {children}
          </RainbowKitProvider>
        </WagmiMountedContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
