'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminShortcut() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+A (or Cmd+Shift+A on Mac)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        router.push('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [router]);

  return null;
}
