'use server';

import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { randomUUID } from 'crypto';
import { verifyMessage } from 'viem';
import { supabase } from './supabaseClient';

const SESSION_COOKIE = 'fraction_session';
const SESSION_AUD = 'fraction-user';
const SESSION_EXP_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is missing');
  }
  return new TextEncoder().encode(secret);
}

export async function signInAction(input: { address: string; message: string; signature: string }) {
  const { address, message, signature } = input;

  // ensure the signature matches the expected hex template type
  await verifyMessage({
    address: address as `0x${string}`,
    message,
    signature: signature as `0x${string}`,
  });

  const { data: userRow } = await supabase
    .from('users')
    .upsert({ address, role: 'user' }, { onConflict: 'address' })
    .select('role')
    .single();

  const role = userRow?.role ?? 'user';

  const token = await new SignJWT({ address, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setJti(randomUUID())
    .setExpirationTime(SESSION_EXP_SECONDS)
    .setAudience(SESSION_AUD)
    .setIssuer('fraction')
    .sign(getJwtSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_EXP_SECONDS,
  });

  return { ok: true, role };
}
