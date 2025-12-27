import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { getSession } from '@/lib/auth.server';
import { supabase } from '@/lib/supabaseClient';

const jetBrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space', display: 'swap' });

// We don't need a return payload — use redirect/throw for control flow
async function createPropertyAction(formData: FormData): Promise<void> {
  'use server';

  const session = await getSession();
  if (!session) {
    redirect('/');
  }
  if (session.role !== 'admin') {
    throw new Error('Forbidden');
  }

  const title = formData.get('title')?.toString() || '';
  const apy = Number(formData.get('apy'));
  const tokenPrice = Number(formData.get('tokenPrice'));
  const totalSupply = Number(formData.get('totalSupply'));
  const file = formData.get('image') as File | null;

  if (!title || Number.isNaN(apy) || Number.isNaN(tokenPrice) || Number.isNaN(totalSupply)) {
    throw new Error('Missing required fields');
  }

  let imageUrl: string | null = null;
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop();
    const path = `properties/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('properties').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (uploadError) {
      throw new Error(uploadError.message);
    }
    const { data } = supabase.storage.from('properties').getPublicUrl(path);
    imageUrl = data.publicUrl;
  }

  const { error } = await supabase.from('properties').insert({
    title,
    apy,
    token_price: tokenPrice,
    total_supply: totalSupply,
    image: imageUrl,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  revalidatePath('/');
  // Redirect back to admin on success
  redirect('/admin');
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session) {
    redirect('/');
  }
  if (session.role !== 'admin') {
    return <div className="p-8 text-red-400">403 Forbidden</div>;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-neutral-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="space-y-2">
          <h1 className={`${spaceGrotesk.className} text-3xl font-bold text-neutral-50`}>Admin Dashboard</h1>
          <p className="text-sm text-neutral-500">Create new properties and manage supply.</p>
        </header>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 shadow-[0_0_20px_rgba(204,255,0,0.05)]">
          <form action={createPropertyAction} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-300">Title</label>
              <input
                name="title"
                required
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-lime-300/60 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm text-neutral-300">APY (%)</label>
                <input
                  name="apy"
                  type="number"
                  step="0.1"
                  required
                  className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-lime-300/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-300">Token Price ($)</label>
                <input
                  name="tokenPrice"
                  type="number"
                  step="0.01"
                  required
                  className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-lime-300/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-300">Total Supply</label>
                <input
                  name="totalSupply"
                  type="number"
                  required
                  className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-lime-300/60 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-neutral-300">Image</label>
              <input
                name="image"
                type="file"
                accept="image/*"
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-lime-300/60 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className={`${jetBrains.className} w-full rounded-lg bg-lime-300 px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition hover:bg-lime-200`}
            >
              Create Property
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
