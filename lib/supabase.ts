import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let sb: ReturnType<typeof createClient> | undefined;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // Do not throw during build; export undefined to keep build working. Runtime code should handle missing client.
  // This avoids hard errors when building in environments without secrets.
  // If you want strict behavior, provide SUPABASE_* in env or restore the throw.
  // eslint-disable-next-line no-console
  console.warn('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY not set — Supabase client not created');
} else {
  sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    global: { headers: { 'x-from': 'fraction-server' } },
  });
}

export { sb };
