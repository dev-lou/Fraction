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

      // Import marker images (bundler-friendly)
      const liveIcon = L.divIcon({
        className: 'pulse-marker live',
        html: '<span class="dot"></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const queuedIcon = L.divIcon({
        className: 'pulse-marker queued',
        html: '<span class="dot"></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const soldIcon = L.divIcon({
        className: 'pulse-marker sold',
        html: '<span class="dot"></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      if (cancelled) return;

      const container = containerRef.current;
      if (!container) return;

      // Create a fresh child div to hold the leaflet map to avoid reusing the same container
      const mapEl = document.createElement('div');
      mapEl.style.width = '100%';
      mapEl.style.height = '100%';
      // ensure full height inherited
      mapEl.className = 'leaflet-wrap';
      container.appendChild(mapEl);
      childRef.current = mapEl;

      // Initialize the map
      try {
        // If there is an old map instance on the element, remove it first
        if ((mapRef.current as any)?.remove) {
          try {
            mapRef.current.remove();
          } catch (e) {
            /* ignore */
          }
        }

        const map = L.map(mapEl, {
          center: [20, 0],
          zoom: 2,
          scrollWheelZoom: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const bounds: any[] = [];

        PROPERTIES.forEach((p) => {
          const icon = p.status === 'live' ? liveIcon : p.status === 'coming-soon' ? queuedIcon : soldIcon;
          const marker = L.marker(p.latLng, { icon }).addTo(map);
          marker.on('click', () => {
            setSelected(p);
            map.setView(p.latLng, Math.max(map.getZoom(), 4), { animate: true });
          });
          bounds.push(p.latLng);
        });

        if (bounds.length) {
          map.fitBounds(bounds, { padding: [40, 40] });
        }

        mapRef.current = map;
      } catch (err) {
        // If initialization fails, clean up the element
        try {
          if (mapEl.parentNode) mapEl.parentNode.removeChild(mapEl);
        } catch (e) {
          /* ignore */
        }
        throw err;
      }
    }

    setup();

    return () => {
      cancelled = true;
      try {
        if (mapRef.current && typeof mapRef.current.remove === 'function') {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (e) {
        /* ignore */
      }
      try {
        if (childRef.current && childRef.current.parentNode) {
          childRef.current.parentNode.removeChild(childRef.current);
          childRef.current = null;
        }
      } catch (e) {
        /* ignore */
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full rounded-2xl border border-neutral-800" />

      {selected && (
        <div className="pointer-events-auto absolute left-4 bottom-4 z-[500] w-[380px] max-w-[90vw] rounded-2xl border border-neutral-800 bg-neutral-950/90 shadow-[0_14px_44px_rgba(0,0,0,0.48)] backdrop-blur">
          <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
            <img src={selected.render} alt={selected.title} className="h-full w-full object-cover" />
            <div className="absolute left-3 top-3 rounded-full border border-lime-300/40 bg-neutral-900/80 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-lime-200">
              {selected.status === 'live' ? 'Live' : selected.status === 'coming-soon' ? 'Coming Soon' : 'Sold Out'}
            </div>
          </div>
          <div className="space-y-2 px-4 py-3 text-sm text-neutral-200">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold leading-tight">{selected.title}</p>
              <span className="text-xs text-neutral-500 whitespace-nowrap">{selected.city}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-neutral-500">APY</p>
                <p className="font-semibold text-lime-200 text-sm">{selected.apy}</p>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-neutral-500">Token</p>
                <p className="font-semibold text-lime-200 text-sm">{selected.tokenPrice}</p>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-neutral-500">Avail</p>
                <p className="font-semibold text-lime-200 text-sm">{Math.round((selected.available / selected.total) * 100)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

