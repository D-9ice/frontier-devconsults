import AdminPageGuard from '@/components/AdminPageGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminPageGuard>{children}</AdminPageGuard>;
}
