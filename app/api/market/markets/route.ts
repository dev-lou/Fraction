import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const vs_currency = url.searchParams.get('vs_currency') || 'usd';
    const per_page = url.searchParams.get('per_page') || '100';
    const page = url.searchParams.get('page') || '1';

    const params = new URLSearchParams({
      vs_currency,
      order: 'market_cap_desc',
      per_page,
      page,
      sparkline: 'true',
      price_change_percentage: '1h,24h,7d',
    });
    if (category) params.set('category', category);

    const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?${params.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('CoinGecko returned non-OK', res.status, txt);
      return NextResponse.json({ error: 'CoinGecko fetch failed', status: res.status, body: txt }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('market proxy error', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
