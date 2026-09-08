'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
export default function VisitorTracker() {
  const pathname = usePathname();
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      clearInterval(timer);
      if (pathname.startsWith('/admin') || localStorage.getItem('frontier-analytics-consent') !== 'granted' || navigator.doNotTrack === '1' || (navigator as Navigator & {globalPrivacyControl?: boolean}).globalPrivacyControl) return;
      let session = sessionStorage.getItem('frontier-visitor-session');
      if (!session) { session = crypto.randomUUID(); sessionStorage.setItem('frontier-visitor-session', session); }
      const send = (heartbeat: boolean) => {
        if (document.visibilityState !== 'visible' || localStorage.getItem('frontier-analytics-consent') !== 'granted') return;
        void fetch('/api/track-visitor', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({session,page:pathname,referrer:document.referrer,consent:true,heartbeat})}).catch(() => {});
      };
      send(false); timer = setInterval(() => send(true), 30000);
    };
    start(); window.addEventListener('frontier-consent-changed',start);
    return () => { clearInterval(timer); window.removeEventListener('frontier-consent-changed',start); };
  }, [pathname]);
  return null;
}
