export async function getCoinGeckoMarkets(options: {
    category?: string;
    vs_currency?: string;
    per_page?: string;
    page?: string;
} = {}) {
    const { category, vs_currency = 'usd', per_page = '100', page = '1' } = options;
    const params = new URLSearchParams({
        vs_currency,
        order: 'market_cap_desc',
        per_page,
        page,
        sparkline: 'true',
        price_change_percentage: '1h,24h,7d',
    });
    if (category) params.set('category', category);

    // Use a slightly longer revalidate time to be safe with rate limits
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?${params.toString()}`, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('CoinGecko API error:', res.status, txt);
        throw new Error(`CoinGecko fetch failed: ${res.status}`);
    }

    return res.json();
}
