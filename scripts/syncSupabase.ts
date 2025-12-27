/**
 * Sync script (Supabase) - verifies images and updates on-chain price/availability
 * Run: node ./scripts/syncSupabase.ts (requires SUPABASE_* env + ETH_RPC or price provider)
 */

// use global fetch (Node 18+)
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { sb } from '@/lib/supabase';

async function verifyImage(url: string) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', timeout: 10000 } as any);
    const ok = res.ok && (res.headers.get('content-type') || '').startsWith('image/');
    return { ok, contentType: res.headers.get('content-type') };
  } catch (e) {
    return { ok: false };
  }
}

async function getPriceUSD(symbol?: string): Promise<number | null> {
  if (!symbol) return null;
  try {
    const r = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(symbol)}&vs_currencies=usd`
    );
    const j = await r.json();
    if (j && j[symbol] && j[symbol].usd) return j[symbol].usd;
  } catch (e) {
    // ignore
  }
  return null;
}

async function sync() {
  const rpc = process.env.ETH_RPC || 'https://rpc.ankr.com/eth';
  const client = createPublicClient({ chain: mainnet, transport: http(rpc) });

  console.log('Querying properties from Supabase');
  const { data: properties, error } = await sb!.from('properties').select('*');
  if (error) throw error;

  const block = await client.getBlockNumber();
  console.log('Current block', block);

  for (const p of properties as any[]) {
    console.log('Syncing', p.slug);

    // verify image
    const imgRes = await verifyImage(p.render_url || p.render);
    if (imgRes.ok) {
      // @ts-ignore - runtime script; sb may be undefined during build-time checks
      await sb!.from('properties').update({ image_verified: true, last_image_verified_at: new Date().toISOString() }).eq('id', p.id);
    }

    // fetch price from CoinGecko if token_symbol present in row
    let price = null;
    if (p.token_symbol) {
      price = await getPriceUSD(p.token_symbol);
    }

    // For demo: write price if found and update last_synced_at
    const updates: any = { last_synced_at: new Date().toISOString(), last_block_synced: block };
    if (price != null) updates.token_price_usd = price;

    // @ts-ignore - runtime script; allow dynamic updates for sync script
    await (sb as any)!.from('properties').update(updates).eq('id', p.id);
  }

  console.log('Sync done');
}

sync().catch((e) => {
  console.error(e);
  process.exit(1);
});