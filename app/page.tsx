'use client';

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useMemo, useRef, useState, useEffect, type RefObject } from 'react';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import MapContainer from '../components/Dashboard/MapContainer';
import { PropertyCard } from '../components/Dashboard/PropertyCard';
import { PROPERTIES } from '@/lib/properties';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { StatsMarquee } from '@/components/ui/StatsMarquee';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-space' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-jetbrains' });

const badgeChips = ['Future Financial Prime', 'Sepolia Testnet', 'Streaming Yields', 'Instant Liquidity'];

function useScrollParallax(ref: RefObject<HTMLElement>, from = -40, to = 40) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [from, to]);
  return y;
}

function usePointerTilt(maxTilt = 6) {
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  const onMove: React.MouseEventHandler<HTMLElement> = (e) => {
    const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    const dx = (x / bounds.width - 0.5) * 2;
    const dy = (y / bounds.height - 0.5) * 2;
    tiltX.set(dy * -maxTilt);
    tiltY.set(dx * maxTilt);
  };

  const onLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return { tiltX, tiltY, onMove, onLeave };
}

function HeroSection() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const yForeground = useScrollParallax(heroRef, -30, 30);
  const yBackground = useScrollParallax(heroRef, 20, -20);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start center', 'end start'] });
  const heroImages = PROPERTIES[0];
  const renderOpacity = useTransform(heroProgress, [0.2, 0.7], [0, 1]);
  const tokenOpacity = useTransform(heroProgress, [0.6, 1], [0, 1]);

  return (
    <section ref={heroRef} className="relative overflow-hidden rounded-3xl border border-neutral-900/60 bg-gradient-to-br from-neutral-950 via-neutral-900/70 to-[#0b0b0b] px-6 py-16 md:px-10 md:py-20 min-h-[70vh]">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-gradient-to-br from-lime-400/15 via-emerald-300/10 to-cyan-300/10 blur-3xl"
          style={{ y: yBackground }}
        />
        <motion.div
          className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-gradient-to-tr from-neutral-800/30 via-neutral-700/20 to-neutral-900/20 blur-3xl"
          style={{ y: yForeground }}
        />
        <div className="absolute inset-0 overflow-hidden">

          <motion.img
            src={heroImages.render}
            alt="Render"
            className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-normal"
            style={{ opacity: renderOpacity, y: yForeground }}
          />
          <motion.img
            src={heroImages.tokenized}
            alt="Tokenized"
            className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-screen"
            style={{ opacity: tokenOpacity, y: yForeground }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        </div>
      </div>

      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-8">
          <motion.p
            className={`${jetBrainsMono.className} inline-flex items-center gap-2 rounded-full border border-neutral-800/60 bg-black/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-50 backdrop-blur-sm shadow-[0_6px_20px_rgba(0,0,0,0.6)]`}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Blockchain Real Estate
          </motion.p>

          <div className="space-y-3">
            <motion.h1
              className={`${spaceGrotesk.className} text-4xl font-bold leading-[1.05] tracking-tight text-neutral-50 sm:text-5xl md:text-6xl`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Fraction: Tokenized Real Estate, Reimagined
            </motion.h1>
            <motion.p
              className={`${jetBrainsMono.className} max-w-2xl text-sm text-neutral-400 md:text-base`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              Own programmable slices of iconic buildings. Stream yields, trade instantly, and watch assets morph from blueprint to tokenized reality as you scroll.
            </motion.p>
          </div>

          <motion.div
            className="flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {badgeChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-neutral-800/80 bg-neutral-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-200 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur"
              >
                {chip}
              </span>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.45 }}
          >
            <MagneticButton href="/properties" variant="primary">
              Start Investing
            </MagneticButton>
            <MagneticButton href="/portfolio" variant="ghost">
              View Live Deals
            </MagneticButton>
          </motion.div>
        </div>

        <div className="relative h-[360px] overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900/80 via-[#0f1a12]/60 to-neutral-950/90 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
          <motion.div
            className="absolute inset-4 rounded-[28px] border border-lime-200/20 bg-gradient-to-br from-lime-300/8 via-transparent to-cyan-200/6"
            style={{ y: yForeground }}
            transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          />
          <motion.div
            className="relative z-10 grid h-full grid-rows-[1fr_auto] gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <div className="grid grid-cols-3 gap-3 text-xs text-neutral-300 md:text-sm">
              {[['Streaming APY', '12.4%'], ['Token Price', '$1.08'], ['Supply', '1.2M']].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 p-3 shadow-inner">
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</p>
                  <p className={`${jetBrainsMono.className} mt-1 text-lg font-semibold text-lime-200`}>{value}</p>
                </div>
              ))}
            </div>

            <motion.div
              className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 text-xs text-neutral-200 shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
              style={{ y: yBackground }}
            >
              <div className="flex flex-col">
                <span className="font-semibold text-neutral-50">Live Fractionalization</span>
                <span className={`${jetBrainsMono.className} text-[11px] text-neutral-500`}>Sepolia • Real-time mint</span>
              </div>
              <span className={`${jetBrainsMono.className} rounded-full border border-lime-300/50 bg-lime-300/10 px-3 py-1 text-[11px] font-semibold text-lime-200`}>Streaming</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function BuildingsMapSection() {
  const [active, setActive] = useState(PROPERTIES[0]);
  // 0 = blueprint, 1 = render, 2 = tokenized
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  // Blueprint is fixed to example 'Skyline Vault | NYC'
  const SKYLINE_INDEX = PROPERTIES.findIndex((p) => p.title === 'Skyline Vault | NYC');
  const [blueprintIndex] = useState<number>(() => (SKYLINE_INDEX >= 0 ? SKYLINE_INDEX : 0));
  const BLUEPRINT_IMAGE = 'https://d1y8sb8igg2f8e.cloudfront.net/images/Pixabay_-_Blockchain_Blueprint-3585482_1920.width-800.jpg';
  const leftProps = PROPERTIES.slice(0, 6); // first 6 cards sit beside the slideshow
  const bottomProps = PROPERTIES.slice(6); // remaining cards go in dense grid below
  const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80';
  const RENDER_IMAGE = 'https://www.bytetree.com/content/images/2023/05/2023-04-27-token-takeaway-76-banner.jpg';
  const TOKENIZED_IMAGE = 'https://forkast.news/wp-content/uploads/2023/11/FORKAST-IMAGES-4.png';

  // schedule next phase based on current `phaseIndex` so durations vary per phase
  useEffect(() => {
    // ensure we always start on blueprint when `active` changes
    setPhaseIndex(0);
  }, [active]);

  useEffect(() => {
    // duration: blueprint 6s, render/tokenized 3s
    const duration = phaseIndex === 0 ? 6000 : 3000;
    const id = setTimeout(() => setPhaseIndex((p) => (p + 1) % 3), duration);
    return () => clearTimeout(id);
  }, [phaseIndex]);

  const slideshowPhases = () => {
    return [
      { phase: 'blueprint' as const, src: BLUEPRINT_IMAGE, property: PROPERTIES[SKYLINE_INDEX >= 0 ? SKYLINE_INDEX : 0] },
      { phase: 'render' as const, src: RENDER_IMAGE, property: active },
      { phase: 'tokenized' as const, src: TOKENIZED_IMAGE, property: active },
    ];
  };


  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={`${spaceGrotesk.className} text-2xl font-semibold text-neutral-50`}>Buildings in Motion</h2>
      </div>

      <div className="grid gap-2 lg:grid-cols-[2fr_1.1fr] items-start">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-rows-3 auto-rows-fr items-stretch">
          {leftProps.map((property, idx) => {
            const fundedPercent = Math.max(
              0,
              Math.min(
                100,
                property.status === 'coming-soon'
                  ? 0
                  : Math.round(((property.total - property.available) / property.total) * 100),
              ),
            );

            return (
              <motion.button
                key={property.title}
                onClick={() => setActive(property)}
                className="group h-28 rounded-2xl border border-neutral-800/60 bg-neutral-900/60 p-2 text-left transition flex flex-col justify-between"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ delay: idx * 0.04, duration: 0.32 }}
              >
                <div className="flex items-center justify-between">
                  <p className={`${spaceGrotesk.className} text-sm font-semibold text-neutral-100`}>{property.title}</p>
                  <span className={`${jetBrainsMono.className} text-xs font-semibold text-lime-400`}>{fundedPercent}%</span>
                </div>
                <p className={`${jetBrainsMono.className} mt-1 text-[11px] text-neutral-500`}>Token {property.tokenPrice}</p>
                <div className="mt-2 h-1 w-full rounded-full bg-neutral-800">
                  <motion.div
                    className="h-1 rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300"
                    initial={{ width: '0%' }}
                    animate={{ width: `${fundedPercent}%` }}
                    style={{ width: `${fundedPercent}%` }}
                    aria-valuenow={fundedPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    title={`${fundedPercent}% funded`}
                    transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="grid gap-2 h-full">
          <div
            className="relative h-full overflow-hidden rounded-3xl border border-neutral-900 bg-gradient-to-br from-neutral-950/80 via-neutral-900/70 to-neutral-950 p-0"
          >
            <div className="relative z-10 grid gap-4">
              <div className="relative overflow-hidden rounded-[20px] border border-neutral-800 bg-neutral-900/60 h-full min-h-[320px] lg:min-h-[360px]">
                <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-black/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-50 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
                  {slideshowPhases().map(({ phase }, i, arr) => (
                    <span key={phase} className="inline-flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded ${i === phaseIndex ? 'bg-lime-300 text-black' : 'bg-transparent text-neutral-50'}`}>{phase.toUpperCase()}</span>
                      {i < arr.length - 1 && <span className="opacity-60">→</span>}
                    </span>
                  ))}
                </div>

                {/* No property title or right-top badge during any phase per request */}

                <div className="h-full w-full overflow-hidden rounded-[16px]">
                  <AnimatePresence mode="sync">
                    {slideshowPhases().map(({ phase, src, property }, i) => (
                      <motion.img
                        key={`${property.title}-${phase}-${blueprintIndex}`}
                        src={src || FALLBACK_IMAGE}
                        alt={`${property.title} ${phase}`}
                        className="absolute inset-0 h-full w-full object-cover"
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: i === phaseIndex ? 1 : 0, scale: i === phaseIndex ? 1 : 1.02 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        style={{ zIndex: i === phaseIndex ? 3 : 2 - i, mixBlendMode: phase === 'blueprint' ? 'screen' : 'normal' }}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          if (img.dataset.fallbackApplied === 'true') return;
                          img.dataset.fallbackApplied = 'true';
                          img.src = FALLBACK_IMAGE;
                        }}
                      />
                    ))}
                  </AnimatePresence>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                </div>
              </div>
            </div>
          </div>

      </div>

      </div>

      {bottomProps.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
          {bottomProps.map((property, idx) => {
            const fundedPercent = Math.max(
              0,
              Math.min(
                100,
                property.status === 'coming-soon'
                  ? 0
                  : Math.round(((property.total - property.available) / property.total) * 100),
              ),
            );

            return (
              <motion.button
                key={property.title}
                onClick={() => setActive(property)}
                className="group h-28 rounded-2xl border border-neutral-800/60 bg-neutral-900/60 p-2 text-left transition flex flex-col justify-between"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ delay: idx * 0.02, duration: 0.28 }}
              >
                <div className="flex items-center justify-between">
                  <p className={`${spaceGrotesk.className} text-sm font-semibold text-neutral-100`}>{property.title}</p>
                  <span className={`${jetBrainsMono.className} text-sm font-semibold text-lime-300`}>{fundedPercent}%</span>
                </div>
                <p className={`${jetBrainsMono.className} mt-2 text-[12px] text-neutral-500`}>Token {property.tokenPrice}</p>
                <div className="mt-3 h-1 w-full rounded-full bg-neutral-800">
                  <motion.div
                    className="h-1 rounded-full bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300"
                    initial={{ width: '0%' }}
                    animate={{ width: `${fundedPercent}%` }}
                    style={{ width: `${fundedPercent}%` }}
                    aria-valuenow={fundedPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    title={`${fundedPercent}% funded`}
                    transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function BigMapSection() {
  return (
    <section id="global-footprint" className="w-full">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-900 bg-gradient-to-br from-neutral-950/70 to-neutral-900/60 p-6">
        <div className="w-full">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className={`${spaceGrotesk.className} text-2xl font-semibold text-neutral-50`}>Global Footprint</h2>
              <span className={`${jetBrainsMono.className} text-xs rounded-full border border-lime-300/40 bg-lime-300/10 px-2 py-1 text-lime-200`}>Live • Sepolia</span>
            </div>
            <a
              href="#global-footprint"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-800 px-3 py-2 text-sm text-neutral-200 transition hover:border-lime-400/70 hover:text-lime-300"
            >
              View full map
            </a>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-5">
            {[['APY', '9.8%'], ['Token', '$0.92'], ['Status', 'Stream']].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 text-sm">
                <p className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</p>
                <p className={`${jetBrainsMono.className} mt-1 text-lg font-semibold text-lime-200`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="h-[420px] md:h-[560px] lg:h-[680px] w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70">
            <MapContainer />
          </div>
        </div>
      </div>
    </section>
  );
}

function TokenizedShowcaseSection() {
  const cards = useMemo(
    () => [
      {
        title: 'Programmable Ownership',
        body: 'NFT + ERC20 duality with streaming yields and time-locked vesting baked in.',
        accent: 'from-emerald-300 to-cyan-300',
      },
      {
        title: 'Instant Liquidity',
        body: 'Deep liquidity pools with oracle-aware pricing keep spreads tight and exits easy.',
        accent: 'from-lime-300 to-emerald-400',
      },
      {
        title: 'Onchain Proof',
        body: 'Every rent stream, vote, and maintenance record is notarized and queryable.',
        accent: 'from-cyan-300 to-blue-400',
      },
    ],
    [],
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className={`${spaceGrotesk.className} text-2xl font-semibold text-neutral-50`}>Tokenized Showcase</h2>
        <p className={`${jetBrainsMono.className} text-sm text-neutral-500`}>Hover to unlock micro-interactions.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {cards.map((card, idx) => (
          <motion.div
            key={card.title}
            className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.35)]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.45, delay: idx * 0.05 }}
            whileHover={{ y: -6, scale: 1.01 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 transition duration-500 group-hover:opacity-10`} />
            <div className="flex items-center justify-between">
              <h3 className={`${spaceGrotesk.className} text-lg font-semibold text-neutral-50`}>{card.title}</h3>
              <motion.span
                className="h-9 w-9 rounded-full border border-neutral-700 bg-neutral-800/70 text-center text-xl text-lime-200"
                whileHover={{ rotate: 8, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              >
                •
              </motion.span>
            </div>
            <p className={`${jetBrainsMono.className} mt-3 text-sm text-neutral-400`}>{card.body}</p>
            <motion.div
              className="mt-4 h-[3px] w-full rounded-full bg-neutral-800"
              initial={{ width: '35%' }}
              whileHover={{ width: '100%' }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-2 py-12 text-neutral-100 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-none flex-col gap-16">
        <HeroSection />
        <StatsMarquee />
        <BuildingsMapSection />
        <BigMapSection />
        <TokenizedShowcaseSection />
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className={`${spaceGrotesk.className} text-2xl font-semibold text-neutral-50`}>Marketplace Preview</h2>
            <span className={`${jetBrainsMono.className} text-sm text-neutral-500`}>Hover to reveal metrics</span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {PROPERTIES.map((property, idx) => (
              <motion.div
                key={property.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
