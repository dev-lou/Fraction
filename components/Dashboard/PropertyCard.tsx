'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import type { Property } from '@/lib/properties';

const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

type PropertyCardProps = {
  property: Property;
  ctaHref?: string;
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80';

function statusChip(status: Property['status']) {
  switch (status) {
    case 'live':
      // darker, higher-contrast Live badge for readability
      return { label: 'Live', className: 'bg-lime-600 text-black border-lime-700' };
    case 'coming-soon':
      return { label: 'Coming Soon', className: 'bg-amber-300/10 text-amber-200 border-amber-200/50' };
    case 'sold-out':
      return { label: 'Sold Out', className: 'bg-neutral-700/30 text-neutral-300 border-neutral-600/60' };
    default:
      return { label: 'Live', className: 'bg-lime-300/15 text-lime-200 border-lime-300/40' };
  }
}

export function PropertyCard({ property, ctaHref = '/properties' }: PropertyCardProps) {
  const { title, apy, tokenPrice, render, status, available, total, city } = property;
  const [src, setSrc] = useState(render || FALLBACK_IMAGE);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const imageShellRef = useRef<HTMLDivElement | null>(null);
  const tiltX = useRef<ReturnType<typeof gsap.quickTo>>();
  const tiltY = useRef<ReturnType<typeof gsap.quickTo>>();
  const percentRemaining = useMemo(() => {
    if (!total) return 0;
    return Math.max(0, Math.min(100, Math.round((available / total) * 100)));
  }, [available, total]);
  const chip = statusChip(status);
  const isActionable = status === 'live' && available > 0;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!cardRef.current) return;
      gsap.fromTo(
        cardRef.current,
        { y: 18, opacity: 0.65, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' },
      );
      gsap.to(cardRef.current, {
        y: -4,
        rotate: -0.2,
        duration: 2.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 0.35,
      });
      if (imageShellRef.current) {
        gsap.to(imageShellRef.current, {
          scale: 1.03,
          rotate: 0.35,
          duration: 3.2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 0.5,
        });
      }
    }, cardRef);

    if (cardRef.current) {
      tiltX.current = gsap.quickTo(cardRef.current, 'rotateX', { duration: 0.35, ease: 'expo.out' });
      tiltY.current = gsap.quickTo(cardRef.current, 'rotateY', { duration: 0.35, ease: 'expo.out' });
    }

    return () => ctx.revert();
  }, []);

  const handleMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const bounds = cardRef.current?.getBoundingClientRect();
    if (!bounds || !tiltX.current || !tiltY.current) return;
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    const dx = (x / bounds.width - 0.5) * 2;
    const dy = (y / bounds.height - 0.5) * 2;
    tiltX.current(dy * -5);
    tiltY.current(dx * 5);
  };

  const handleLeave = () => {
    tiltX.current?.(0);
    tiltY.current?.(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className="group relative overflow-hidden rounded-2xl border border-neutral-800/70 bg-gradient-to-br from-neutral-900/80 to-neutral-950/80 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.35)]"
      whileHover={{ y: -10, scale: 1.015 }}
      whileTap={{ scale: 0.99 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
    >
      <div className="grid gap-3">
        <div ref={imageShellRef} className="relative h-48 w-full overflow-hidden rounded-xl will-change-transform">
          <Image
            src={src}
            alt={title}
            fill
            className="object-cover brightness-95 transition-transform duration-700 group-hover:scale-105"
            sizes="(min-width: 1024px) 320px, 100vw"
            onError={() => setSrc(FALLBACK_IMAGE)}
            priority={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
          <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] bg-black/60 backdrop-blur-md border-neutral-900/60">
          
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${chip.className}`}>{chip.label}</span>
            <span className={`${jetBrainsMono.className} text-xs text-neutral-50`}>{city}</span>
          </div>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className={`text-lg font-semibold text-neutral-50 ${spaceGrotesk.className}`}>{title}</div>
          <span
            className={`${jetBrainsMono.className} rounded-full bg-lime-300/10 px-3 py-1 text-xs font-medium text-lime-300`}
          >
            APY {apy}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/60 p-3">
            <p className="text-xs uppercase tracking-wide text-neutral-400">Projected APY</p>
            <p className={`${jetBrainsMono.className} mt-1 text-2xl font-semibold text-lime-300`}>{apy}</p>
          </div>
          <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/60 p-3">
            <p className="text-xs uppercase tracking-wide text-neutral-400">Token Price</p>
            <p className={`${jetBrainsMono.className} mt-1 text-2xl font-semibold text-neutral-100`}>{tokenPrice}</p>
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between text-xs text-neutral-400">
          <span>Available</span>
          <span className={`${jetBrainsMono.className} text-neutral-300`}>
            {available.toLocaleString()} / {total.toLocaleString()}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-neutral-800">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300"
            animate={{ width: `${percentRemaining}%` }}
            transition={{ type: 'spring', stiffness: 140, damping: 20 }}
            style={{ minWidth: '8%' }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className={`${jetBrainsMono.className} text-[11px] uppercase tracking-[0.14em] text-neutral-500`}>
            {status === 'live' ? 'Open for investment' : status === 'coming-soon' ? 'Coming soon' : 'Sold out'}
          </div>
          <Link
            href={ctaHref}
            className={`rounded-full px-3 py-2 text-[12px] font-semibold transition ${
              isActionable
                ? 'bg-lime-300 text-[#0a0a0a] hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(120,255,120,0.35)]'
                : 'border border-neutral-800 text-neutral-400 cursor-not-allowed opacity-70'
            }`}
            aria-disabled={!isActionable}
          >
            {isActionable ? 'Invest' : status === 'coming-soon' ? 'Notify me' : 'Sold out'}
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/10" />
      </div>
    </motion.div>
  );
}
