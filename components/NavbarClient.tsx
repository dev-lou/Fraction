'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// Dynamically import ConnectButton.Custom to avoid SSR/hydration issues
const ConnectButtonCustom = dynamic(
  () => import('@rainbow-me/rainbowkit').then((m) => m.ConnectButton.Custom),
  { ssr: false }
);

type SessionShape = {
  address?: string;
  role?: string;
} | null;

function avatarGradient(address?: string) {
  if (!address) return 'linear-gradient(135deg, #1f1f1f, #111)';
  const slice = address.slice(2, 8);
  const hue = parseInt(slice, 16) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 80%, 55%), hsl(${(hue + 60) % 360}, 70%, 45%))`;
}

import { Menu, X } from 'lucide-react';

export function NavbarClient({ session }: { session: SessionShape }) {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;
  const linkClass = (path: string) =>
    `hidden rounded-full border px-3 py-2 text-sm transition md:inline-flex ${isActive(path)
      ? 'border-lime-300/70 bg-lime-300/10 text-lime-200'
      : 'border-neutral-800 text-neutral-200 hover:border-lime-400/70 hover:text-lime-300'
    }`;

  const mobileLinkClass = (path: string) =>
    `block rounded-xl border px-4 py-3 text-lg font-semibold transition ${isActive(path)
      ? 'border-lime-300/70 bg-lime-300/10 text-lime-200'
      : 'border-neutral-800 text-neutral-200 hover:border-lime-400/70 hover:text-lime-300'
    }`;

  return (
    <>
      <header
        suppressHydrationWarning
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-transparent bg-[#0a0a0a]/80 backdrop-blur-md"
        style={{ willChange: 'background-position, background-image' }}
      >
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3 md:px-6 md:py-4 lg:px-10">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full border border-neutral-800 bg-neutral-900 p-2 text-neutral-200 transition hover:bg-neutral-800 md:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="origin-center">
              <Link
                href="/"
                className="text-xl font-semibold tracking-tight text-neutral-50 transition hover:text-lime-300 md:text-2xl"
              >
                <span className="bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  Fraction
                </span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/"
              suppressHydrationWarning
              className={linkClass('/')}
              title="Home"
            >
              Home
            </Link>

            <Link
              href="/properties"
              suppressHydrationWarning
              className={linkClass('/properties')}
              title="Properties"
            >
              Properties
            </Link>

            <Link
              href="/market"
              suppressHydrationWarning
              className={linkClass('/market')}
              title="Market"
            >
              Market
            </Link>

            <Link
              href="/portfolio"
              suppressHydrationWarning
              className={linkClass('/portfolio')}
              title="Portfolio"
            >
              Portfolio
            </Link>

            <div className="relative flex items-center min-w-[40px]">
              {mounted ? (
                <ConnectButtonCustom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted: connectMounted,
                  }) => {
                    const ready = connectMounted && authenticationStatus !== 'loading';
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                    // Return null or placeholder if not ready to avoid layout shift or hydration mismatch
                    if (!ready) {
                      return <div aria-hidden className="h-9 w-9 rounded-full bg-neutral-900 border border-neutral-800" />;
                    }

                    return (
                      <div className="animate-in fade-in duration-200">
                        {(() => {
                          if (!connected) {
                            return <ConnectWithLoading openConnectModal={openConnectModal} />;
                          }

                          if (chain.unsupported) {
                            return (
                              <button
                                onClick={openChainModal}
                                type="button"
                                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                              >
                                Wrong network
                              </button>
                            );
                          }

                          return (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={openChainModal}
                                style={{ display: 'flex', alignItems: 'center' }}
                                type="button"
                                className="hidden items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm font-semibold text-neutral-200 transition hover:bg-neutral-800 md:flex"
                              >
                                {chain.hasIcon && (
                                  <div
                                    style={{
                                      background: chain.iconBackground,
                                      width: 12,
                                      height: 12,
                                      borderRadius: 999,
                                      overflow: 'hidden',
                                      marginRight: 4,
                                    }}
                                  >
                                    {chain.iconUrl && (
                                      <img
                                        alt={chain.name ?? 'Chain icon'}
                                        src={chain.iconUrl}
                                        style={{ width: 12, height: 12 }}
                                      />
                                    )}
                                  </div>
                                )}
                                {chain.name}
                              </button>

                              <button
                                onClick={openAccountModal}
                                type="button"
                                className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-sm font-semibold text-neutral-200 transition hover:bg-neutral-800"
                              >
                                <div
                                  className="h-6 w-6 rounded-full"
                                  style={{ background: avatarGradient(account.address) }}
                                />
                                <span className="mr-1 hidden md:block">
                                  {account.displayName}
                                  {account.displayBalance
                                    ? ` (${account.displayBalance})`
                                    : ''}
                                </span>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButtonCustom>
              ) : (
                <div aria-hidden className="h-9 w-9 rounded-full bg-neutral-900 border border-neutral-800" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0a0a0a] px-4 pt-24 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link href="/" className={mobileLinkClass('/')}>
              Home
            </Link>
            <Link href="/properties" className={mobileLinkClass('/properties')}>
              Properties
            </Link>
            <Link href="/market" className={mobileLinkClass('/market')}>
              Market
            </Link>
            <Link href="/portfolio" className={mobileLinkClass('/portfolio')}>
              Portfolio
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}

function ConnectWithLoading({ openConnectModal }: { openConnectModal: () => void }) {
  const [isConnecting, setIsConnecting] = useState(false);

  return (
    <button
      onClick={() => {
        setIsConnecting(true);
        openConnectModal();
        setTimeout(() => setIsConnecting(false), 4000);
      }}
      type="button"
      disabled={isConnecting}
      className="flex items-center gap-2 rounded-full bg-lime-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-lime-300 active:scale-95 disabled:opacity-80 disabled:cursor-wait"
    >
      {isConnecting && (
        <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
