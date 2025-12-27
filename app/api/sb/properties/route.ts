import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase';

const ADMIN_KEY = process.env.ADMIN_API_KEY;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const city = url.searchParams.get('city');

  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  const q = sb.from('properties').select('*');
  if (status) q.eq('status', status);
  if (city) q.eq('city', city);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  // Protected endpoint for admin upserts
  const apiKey = req.headers.get('x-api-key');
  if (!ADMIN_KEY || apiKey !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    // Minimal validation
    const required = ['slug', 'title', 'city', 'lat', 'lng', 'status', 'render'];
    for (const r of required) {
      if (!body[r]) return NextResponse.json({ error: `Missing ${r}` }, { status: 400 });
    }

    // Verify image quickly (HEAD)
    let image_verified = false;
    try {
      const res = await fetch(body.render, { method: 'HEAD' });
      image_verified = res.ok && (res.headers.get('content-type') || '').startsWith('image/');
    } catch (e) {
      image_verified = false;
    }

    const payload = {
      ...body,
      image_verified,
      last_image_verified_at: image_verified ? new Date().toISOString() : null,
    };

    if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

    const { data, error } = await sb
      .from('properties')
      .upsert(payload, { onConflict: 'slug' })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
