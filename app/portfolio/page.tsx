import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth.server';
import { supabase } from '@/lib/supabaseClient';
import { PortfolioClient, type InvestmentRow } from '@/components/PortfolioClient';

export default async function PortfolioPage() {
  const session = await getSession();
  if (!session) {
    redirect('/');
  }

  const { data } = await supabase
    .from('investments')
    .select('id,tokens,properties(title,apy,token_price)')
    .eq('wallet_address', session.address);

  const rows: InvestmentRow[] = (data as any[]) || [];

  return <PortfolioClient address={session.address!} rows={rows} />;
}
