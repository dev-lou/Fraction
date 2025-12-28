'use client';

import { useEffect, useRef, useState } from 'react';
import { PROPERTIES } from '@/lib/properties';

export default function MapContainer() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const childRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState(PROPERTIES[0]);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      const L = (await import('leaflet')) as any;
      await import('leaflet/dist/leaflet.css');

      // Custom SVG Pin creator
      const createPin = (color: string, glow: string) => L.divIcon({
        className: 'custom-pin-marker',
        html: `
          <div class="relative group" style="width: 48px; height: 48px; transform: translate(-50%, -100%);">
            <div class="absolute inset-0 bg-${glow}-400/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-2xl filter" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
              <path d="M12 0C7.58172 0 4 3.58172 4 8C4 13.25 12 21 12 21C12 21 20 13.25 20 8C20 3.58172 16.4183 0 12 0Z" fill="${color}" stroke="#101010" stroke-width="1"/>
              <circle cx="12" cy="8" r="3.5" fill="#171717"/>
            </svg>
          </div>
        `,
        iconSize: [0, 0], // handled by CSS/HTML constraints
        iconAnchor: [0, 0], // handled by transform in HTML
      });

      const liveIcon = createPin('#a3e635', 'lime'); // Lime-400
      const queuedIcon = createPin('#facc15', 'yellow'); // Red/Amver
      const soldIcon = createPin('#525252', 'gray'); // Neutral-600

      if (cancelled) return;

      const container = containerRef.current;
      if (!container) return;

      const mapEl = document.createElement('div');
      mapEl.style.width = '100%';
      mapEl.style.height = '100%';
      // Dark background to match app while tiles load
      mapEl.style.backgroundColor = '#0a0a0a';
      mapEl.className = 'leaflet-wrap z-0';
      container.appendChild(mapEl);
      childRef.current = mapEl;

      try {
        if ((mapRef.current as any)?.remove) {
          try { mapRef.current.remove(); } catch (e) { }
        }

        const map = L.map(mapEl, {
          center: [20, 0],
          zoom: 2.5,
          minZoom: 2.5,
          maxZoom: 18,
          scrollWheelZoom: false,
          maxBounds: [[-85, -180], [85, 180]], // Limit to one world, cut off poles slightly
          maxBoundsViscosity: 1.0,
        });

        // CartoDB Dark Matter for the modern look
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20,
          noWrap: true, // Prevents horizontal repetition
        }).addTo(map);

        const markers: any[] = [];
        const bounds: any[] = [];

        PROPERTIES.forEach((p) => {
          const icon = p.status === 'live' ? liveIcon : p.status === 'coming-soon' ? queuedIcon : soldIcon;
          const marker = L.marker(p.latLng, { icon }).addTo(map);

          marker.on('click', () => {
            setSelected(p);
            // Smooth fly animation to the pin
            map.flyTo([p.latLng[0] + 5, p.latLng[1]], 6, {
              animate: true,
              duration: 1.5,
              easeLinearity: 0.25
            });
          });

          markers.push(marker);
          bounds.push(p.latLng);
        });

        if (bounds.length) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
        }

        mapRef.current = map;
      } catch (err) {
        try { if (mapEl.parentNode) mapEl.parentNode.removeChild(mapEl); } catch (e) { }
        throw err;
      }
    }

    setup();

    return () => {
      cancelled = true;
      try {
        if (mapRef.current?.remove) { mapRef.current.remove(); mapRef.current = null; }
      } catch (e) { }
      try {
        if (childRef.current?.parentNode) { childRef.current.parentNode.removeChild(childRef.current); childRef.current = null; }
      } catch (e) { }
    };
  }, []);

  return (
    <div className="relative h-full w-full bg-[#0a0a0a]">
      <div ref={containerRef} className="h-full w-full rounded-2xl border border-neutral-900/50 overflow-hidden" />

      {selected && (
        <div className="pointer-events-auto absolute left-4 bottom-4 z-[500] w-[340px] max-w-[calc(100%-2rem)] rounded-2xl border border-neutral-800 bg-neutral-950/80 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md animate-in slide-in-from-bottom-4 duration-500">
          <div className="relative h-40 w-full overflow-hidden rounded-t-2xl">
            <img src={selected.render} alt={selected.title} className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute left-3 top-3">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm ${selected.status === 'live'
                  ? 'bg-lime-500/20 border-lime-400/30 text-lime-200'
                  : 'bg-neutral-800/50 border-neutral-700 text-neutral-400'
                }`}>
                {selected.status.replace('-', ' ')}
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="font-bold text-neutral-100 text-lg leading-tight">{selected.title}</h3>
              <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {selected.city}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-neutral-800/50 border-t border-neutral-800/50">
            <div className="p-3 text-center">
              <p className="text-[10px] uppercase text-neutral-500 font-semibold tracking-wider">APY</p>
              <p className="text-sm font-bold text-lime-300 mt-0.5">{selected.apy}</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-[10px] uppercase text-neutral-500 font-semibold tracking-wider">Price</p>
              <p className="text-sm font-bold text-neutral-200 mt-0.5">{selected.tokenPrice}</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-[10px] uppercase text-neutral-500 font-semibold tracking-wider">Avail</p>
              <p className="text-sm font-bold text-neutral-200 mt-0.5">{Math.round((selected.available / selected.total) * 100)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

