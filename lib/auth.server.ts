import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { randomUUID } from 'crypto';
import { supabase } from './supabaseClient';

const SESSION_COOKIE = 'fraction_session';
const SESSION_AUD = 'fraction-user';
const SESSION_EXP_SECONDS = 60 * 60 * 24 * 7; // 7 days

type SessionPayload = {
  address: string;
  role: string;
};

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is missing');
  }
  return new TextEncoder().encode(secret);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: 'fraction',
      audience: SESSION_AUD,
    });
    const { address, role } = payload as any;
    if (!address) return null;
    return { address, role: role || 'user' };
  } catch (err) {
    return null;
  }
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}
