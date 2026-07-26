'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminEntryPage() {
  const router = useRouter();

  useEffect(() => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    router.replace('/');
  }, [router]);

  return null;
}
