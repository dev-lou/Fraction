'use client';

import { useReducedMotion } from 'framer-motion';

const defaultItems = [
  { label: 'Total Volume', value: '$482M' },
  { label: 'Streams Live', value: '128' },
  { label: 'Avg. APY', value: '10.4%' },
  { label: 'Investors', value: '42.6K' },
  { label: 'Blocks Finalized', value: '12.3M' },
  { label: 'Total Volume', value: '$482M' },
  { label: 'Streams Live', value: '128' },
  { label: 'Avg. APY', value: '10.4' },
];

type StatsMarqueeProps = {
  items?: { label: string; value: string }[];
  // duration in seconds for one full loop
  duration?: number;
};

export function StatsMarquee({ items = defaultItems, duration = 48 }: StatsMarqueeProps) {
  const reduce = useReducedMotion();

  const renderGroup = (rep = 0) => (
    <div className="flex items-center gap-6 px-4 whitespace-nowrap">
      {items.map((item, idx) => (
        <div
          key={`${item.label}-${item.value}-${rep}-${idx}`}
          className="flex items-center gap-2 rounded-full border border-neutral-800/70 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
        >
          <span className="text-neutral-500">{item.label}</span>
          <span className="font-semibold text-lime-200">{item.value}</span>
        </div>
      ))}
    </div>
  );

  if (reduce) {
    return (
      <div className="overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950/80 py-3">{renderGroup(0)}</div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950/80 py-3">
      <div className="marquee" style={{ ['--marquee-duration' as any]: `${duration}s` }}>
        <div className="marquee__track" aria-hidden>
          <div className="marquee__group">{renderGroup(0)}</div>
          <div className="marquee__group">{renderGroup(1)}</div>
          <div className="marquee__group">{renderGroup(2)}</div>
        </div>
      </div>
    </div>
  );
}
