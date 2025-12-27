import { getSession } from '@/lib/auth.server';
import { NavbarClient } from './NavbarClient';

export default async function Navbar() {
  const session = await getSession();
  return <NavbarClient session={session} />;
}
