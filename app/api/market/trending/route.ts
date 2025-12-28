import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/search/trending', { next: { revalidate: 60 } });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('CoinGecko trending non-ok', res.status, txt);
      return NextResponse.json({ error: 'CoinGecko trending fetch failed', status: res.status, body: txt }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('trending proxy error', err);
    return NextResponse.json({ error: err.message || 'Unknown' }, { status: 500 });
  }
}
