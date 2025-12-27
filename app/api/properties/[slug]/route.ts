import { NextRequest, NextResponse } from 'next/server';
import { PROPERTIES } from '@/lib/properties';

export async function GET(req: NextRequest, ctx: any) {
  const params = ctx.params;
  const resolvedParams = params && typeof params.then === 'function' ? await params : params;
  const slug = resolvedParams?.slug;
  const prop = PROPERTIES.find((p) => p.title.toLowerCase().includes((slug || '').toLowerCase()));
  if (!prop) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(prop);
}

export async function DELETE(req: NextRequest, ctx: any) {
  const apiKey = req.headers.get('x-api-key');
  if (!process.env.ADMIN_API_KEY || apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const params = ctx.params;
  const resolvedParams = params && typeof params.then === 'function' ? await params : params;
  const slug = resolvedParams?.slug;

  const idx = PROPERTIES.findIndex((p) => p.title.toLowerCase().includes((slug || '').toLowerCase()));
  if (idx >= 0) {
    PROPERTIES.splice(idx, 1);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
