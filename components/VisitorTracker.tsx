'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

type PrivacyNavigator = Navigator & { globalPrivacyControl?: boolean };

function privacySignalActive() {
  return navigator.doNotTrack === '1' || Boolean((navigator as PrivacyNavigator).globalPrivacyControl);
}

function firstPartyOptedOut() {
  const explicit = localStorage.getItem('frontier-first-party-opt-out');
  if (explicit === '1') return true;
  if (explicit === '0') return false;

  // Preserve a visitor's previous explicit "No thanks" choice from the old
  // all-or-nothing banner while making privacy-minimized first-party
  // measurement automatic for new visitors.
  if (localStorage.getItem('frontier-analytics-consent') === 'denied') {
    localStorage.setItem('frontier-first-party-opt-out', '1');
    return true;
  }
  return false;
}

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      clearInterval(timer);
      if (pathname.startsWith('/admin') || privacySignalActive() || firstPartyOptedOut()) return;

      let session = sessionStorage.getItem('frontier-visitor-session');
      if (!session) {
        session = crypto.randomUUID();
        sessionStorage.setItem('frontier-visitor-session', session);
      }

      const send = (heartbeat: boolean) => {
        if (document.visibilityState !== 'visible' || privacySignalActive() || firstPartyOptedOut()) return;
        void fetch('/api/track-visitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session,
            page: pathname,
            referrer: document.referrer,
            heartbeat,
          }),
        }).catch(() => {});
      };

      send(false);
      timer = setInterval(() => send(true), 30000);
    };

    start();
    window.addEventListener('frontier-first-party-analytics-changed', start);
    return () => {
      clearInterval(timer);
      window.removeEventListener('frontier-first-party-analytics-changed', start);
    };
  }, [pathname]);

  return null;
}
