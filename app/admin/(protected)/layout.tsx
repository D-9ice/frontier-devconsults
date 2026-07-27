import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ADMIN_SESSION_COOKIE, isAdminSessionToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  if (!isAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    redirect('/');
  }

  return <>{children}</>;
}
