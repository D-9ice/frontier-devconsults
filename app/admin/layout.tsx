import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = { title: 'Administration', robots: { index: false, follow: false, noarchive: true } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
