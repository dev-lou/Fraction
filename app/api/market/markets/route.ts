import { NextResponse } from 'next/server';
import { getCoinGeckoMarkets } from '@/lib/coingecko';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || undefined;
    const vs_currency = url.searchParams.get('vs_currency') || 'usd';
    const per_page = url.searchParams.get('per_page') || '100';
    const page = url.searchParams.get('page') || '1';

    const data = await getCoinGeckoMarkets({ category, vs_currency, per_page, page });
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('market proxy error', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
