'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminPageGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(pathname !== '/admin');
  const [isAuthenticated, setIsAuthenticated] = useState(pathname === '/admin');

  useEffect(() => {
    if (pathname === '/admin') {
      setIsChecking(false);
      setIsAuthenticated(true);
      return;
    }

    let isMounted = true;
    fetch('/api/admin/session', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          router.replace('/admin');
        }
      })
      .catch(() => router.replace('/admin'))
      .finally(() => isMounted && setIsChecking(false));

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (pathname !== '/admin' && (isChecking || !isAuthenticated)) {
    return <main className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">Loading...</main>;
  }

  return <>{children}</>;
}
