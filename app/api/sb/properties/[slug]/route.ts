import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase';

export async function GET(req: NextRequest, ctx: any) {
  const params = ctx.params;
  const resolvedParams = params && typeof params.then === 'function' ? await params : params;
  const slug = resolvedParams?.slug;
  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  const { data, error } = await sb.from('properties').select('*').eq('slug', slug).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, ctx: any) {
  const apiKey = req.headers.get('x-api-key');
  if (!process.env.ADMIN_API_KEY || apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = ctx.params;
  const resolvedParams = params && typeof params.then === 'function' ? await params : params;
  const slug = resolvedParams?.slug;

  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  const { error } = await sb.from('properties').delete().eq('slug', slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
