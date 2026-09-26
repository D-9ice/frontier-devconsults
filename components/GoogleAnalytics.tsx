'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const measurementId = process.env.NEXT_PUBLIC_GA_ID?.trim();

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

function allowed() {
  return localStorage.getItem('frontier-analytics-consent') === 'granted'
    && navigator.doNotTrack !== '1'
    && !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    if (!measurementId) return;
    const start = () => {
      const analyticsWindow = window as AnalyticsWindow;
      if (!allowed()) {
        analyticsWindow.gtag?.('consent', 'update', { analytics_storage: 'denied' });
        return;
      }

      analyticsWindow.dataLayer ||= [];
      analyticsWindow.gtag ||= (...args: unknown[]) => { analyticsWindow.dataLayer!.push(args); };

      if (!initialized.current) {
        analyticsWindow.gtag('consent', 'default', { analytics_storage: 'granted' });
        analyticsWindow.gtag('js', new Date());
        analyticsWindow.gtag('config', measurementId, { send_page_view: false, anonymize_ip: true });

        if (!document.querySelector(`script[data-frontier-ga="${measurementId}"]`)) {
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
          script.dataset.frontierGa = measurementId;
          document.head.appendChild(script);
        }
        initialized.current = true;
      }

      analyticsWindow.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    };

    start();
    window.addEventListener('frontier-consent-changed', start);
    return () => window.removeEventListener('frontier-consent-changed', start);
  }, [pathname]);

  return null;
}
