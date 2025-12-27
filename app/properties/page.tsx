'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { PropertyCard } from '../../components/Dashboard/PropertyCard';
import { PROPERTIES, type PropertyStatus } from '@/lib/properties';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-space' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-jetbrains' });

const statusFilters: { label: string; value: 'all' | PropertyStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Live', value: 'live' },
  { label: 'Coming Soon', value: 'coming-soon' },
  { label: 'Sold Out', value: 'sold-out' },
];

export default function PropertiesPage() {
  const [status, setStatus] = useState<'all' | PropertyStatus>('all');
  const [city, setCity] = useState<string>('all');

  const cities = useMemo(() => ['all', ...Array.from(new Set(PROPERTIES.map((p) => p.city)))], []);

  const filtered = useMemo(
    () =>
      PROPERTIES.filter((p) => (status === 'all' ? true : p.status === status) && (city === 'all' ? true : p.city === city)),
    [status, city],
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-0 py-12 text-neutral-100 sm:px-4 md:px-6 lg:px-8">
      <div className="w-full space-y-8">
        <header className="space-y-2">
          <h1 className={`${spaceGrotesk.className} text-3xl font-bold text-neutral-50`}>Properties</h1>
          <p className={`${jetBrainsMono.className} text-sm text-neutral-400`}>
            Browse all tokenized assets. Filter by status and city.
          </p>
        </header>

        <div className="flex flex-wrap gap-3">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                status === f.value ? 'border-lime-300/70 bg-lime-300/10 text-lime-200' : 'border-neutral-800 bg-neutral-900 text-neutral-200'
              }`}
            >
              {f.label}
            </button>
          ))}

          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-lime-300/70 focus:outline-none"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Cities' : c}
              </option>
            ))}
          </select>
        </div>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((prop, idx) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
            >
              <PropertyCard property={prop} ctaHref={`/properties`} />
            </motion.div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-neutral-500">No properties match your filters.</p>}
        </section>
      </div>
    </main>
  );
}
