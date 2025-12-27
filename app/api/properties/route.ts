import { NextRequest, NextResponse } from 'next/server';
import { PROPERTIES, type Property } from '@/lib/properties';

const ADMIN_KEY = process.env.ADMIN_API_KEY;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const city = url.searchParams.get('city');

  let props = PROPERTIES.slice();
  if (status) props = props.filter((p) => p.status === status);
  if (city) props = props.filter((p) => p.city === city);

  // sort by title as a stable order (server DB removed)
  props.sort((a, b) => a.title.localeCompare(b.title));
  return NextResponse.json(props);
}

export async function POST(req: NextRequest) {
  // Protected endpoint for admin upserts (in-memory only)
  const apiKey = req.headers.get('x-api-key');
  if (!ADMIN_KEY || apiKey !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    // Minimal validation
    const required = ['slug', 'title', 'city', 'latLng', 'status', 'render'];
    for (const r of required) {
      if (!body[r]) return NextResponse.json({ error: `Missing ${r}` }, { status: 400 });
    }

    // In-memory upsert (non-persistent)
    const idx = PROPERTIES.findIndex((p) => p.title.toLowerCase().includes(body.slug || body.title?.toLowerCase()));
    const newProp: Property = {
      title: body.title,
      apy: body.apy || '0% ',
      tokenPrice: body.tokenPrice || '$0.00',
      city: body.city,
      status: body.status,
      available: body.available || 0,
      total: body.total || 1,
      blueprint: body.blueprint || body.render || '',
      render: body.render,
      tokenized: body.tokenized || body.render,
      latLng: body.latLng,
    };

    if (idx >= 0) {
      PROPERTIES[idx] = { ...PROPERTIES[idx], ...newProp };
      return NextResponse.json(PROPERTIES[idx]);
    }

    PROPERTIES.push(newProp);
    return NextResponse.json(newProp, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
