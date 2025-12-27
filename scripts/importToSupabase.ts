/**
 * Simple import script to seed Supabase from local `lib/properties.ts` array
 * Run: node ./scripts/importToSupabase.ts (requires SUPABASE_* env set)
 */

import { sb } from '@/lib/supabase';
import { PROPERTIES } from '@/lib/properties';

async function importAll() {
  for (const p of PROPERTIES) {
    const payload = {
      slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: p.title,
      city: p.city,
      lat: p.latLng[0],
      lng: p.latLng[1],
      status: p.status,
      apy: p.apy,
      token_price_usd: null,
      token_contract: null,
      available: p.available,
      total: p.total,
      blueprint_url: p.blueprint,
      render_url: p.render,
      tokenized_url: p.tokenized,
    } as any;

    const { error } = await sb!.from('properties').upsert(payload, { onConflict: 'slug' });
    if (error) {
      console.error('Failed import', p.title, error.message);
    } else {
      console.log('Imported', p.title);
    }
  }
}

importAll().catch((e) => {
  console.error(e);
  process.exit(1);
});