'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { LoginButton } from './LoginButton';

type SessionShape = {
  address?: string;
  role?: string;
} | null;

const ConnectButton = dynamic(() => import('@rainbow-me/rainbowkit').then((m) => m.ConnectButton), { ssr: false });

function avatarGradient(address?: string) {
  if (!address) return 'linear-gradient(135deg, #1f1f1f, #111)';
  const slice = address.slice(2, 8);
  const hue = parseInt(slice, 16) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 80%, 55%), hsl(${(hue + 60) % 360}, 70%, 45%))`;
}

export function NavbarClient({ session }: { session: SessionShape }) {
  const headerRef = useRef<HTMLElement | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const mxSpring = useSpring(mx, { stiffness: 220, damping: 28 });
  const mySpring = useSpring(my, { stiffness: 220, damping: 28 });

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    function onMove(e: MouseEvent) {
      const h = headerRef.current;
      if (!h) return;
      const rect = h.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      mx.set(x);
      my.set(y);
    }

    function onLeave() {
      mx.set(0);
      my.set(0);
    }

    function onScroll() {
      const h = headerRef.current;
      if (!h) return;
      const t = Math.min(1, window.scrollY / 600);
      // subtle background alpha/position shift
      h.style.backgroundImage = `linear-gradient(90deg, rgba(10,10,10,${0.65 + t * 0.18}), rgba(12,14,20,${0.45 + t * 0.12}))`;
      h.style.backgroundPosition = `${20 + t * 30}% center`;
    }

    header.addEventListener('mousemove', onMove);
    header.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    // init
    onScroll();

    return () => {
      header.removeEventListener('mousemove', onMove);
      header.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll as any);
    };
  }, [mx, my]);

  // element-specific transforms
  const brandX = useTransform(mxSpring, (v) => v * 0.02);
  const brandY = useTransform(mySpring, (v) => v * 0.01);
  const navX = useTransform(mxSpring, (v) => v * 0.035);
  const navY = useTransform(mySpring, (v) => v * 0.015);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 border-b border-transparent bg-[#0a0a0a]/70 backdrop-blur"
      style={{ willChange: 'background-position, background-image' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        <motion.div style={{ x: brandX, y: brandY }} className="origin-center">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-neutral-50 transition hover:text-lime-300 md:text-2xl"
          >
            <span className="bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              Fraction
            </span>
          </Link>
        </motion.div>

        <div className="flex items-center gap-2 md:gap-3">
          <motion.div style={{ x: navX, y: navY }} className="flex items-center gap-2 md:gap-3">
            <Link
              href="/properties"
              className="hidden rounded-full border border-neutral-800 px-3 py-2 text-sm text-neutral-200 transition hover:border-lime-400/70 hover:text-lime-300 md:inline-flex"
            >
              Properties
            </Link>
            {session && (
              <Link
                href="/portfolio"
                className="hidden rounded-full border border-neutral-800 px-3 py-2 text-sm text-neutral-200 transition hover:border-lime-400/70 hover:text-lime-300 md:inline-flex"
              >
                Portfolio
              </Link>
            )}
            {!session && <ConnectButton label="Connect" />}
            {session && (
              <div
                className="h-10 w-10 rounded-full border border-neutral-800"
                style={{ backgroundImage: avatarGradient(session.address) }}
                title={session.address}
              />
            )}
            <LoginButton />
          </motion.div>
        </div>
      </div>
    </header>
  );
}
