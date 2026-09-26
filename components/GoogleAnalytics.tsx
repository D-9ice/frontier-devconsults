'use client';

import { useEffect } from 'react';

const measurementId = process.env.NEXT_PUBLIC_GA_ID?.trim();

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

type PrivacyNavigator = Navigator & { globalPrivacyControl?: boolean };

function privacySignalActive() {
  return navigator.doNotTrack === '1' || Boolean((navigator as PrivacyNavigator).globalPrivacyControl);
}

function analyticsStorageGranted() {
  return !privacySignalActive() && localStorage.getItem('frontier-analytics-consent') === 'granted';
}

export default function GoogleAnalytics() {
  useEffect(() => {
    if (!measurementId || privacySignalActive()) return;

    const analyticsWindow = window as AnalyticsWindow;
    analyticsWindow.dataLayer ||= [];
    analyticsWindow.gtag ||= (...args: unknown[]) => {
      analyticsWindow.dataLayer!.push(args);
    };

    // GA4 Advanced Consent Mode: measurement starts automatically with
    // analytics storage denied. No GA analytics cookie is permitted until the
    // visitor explicitly enables it. Cookieless measurement pings can still
    // contribute to aggregate reporting.
    analyticsWindow.gtag('consent', 'default', {
      analytics_storage: analyticsStorageGranted() ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500,
    });
    analyticsWindow.gtag('set', 'ads_data_redaction', true);
    analyticsWindow.gtag('js', new Date());
    analyticsWindow.gtag('config', measurementId, {
      anonymize_ip: true,
    });

    if (!document.querySelector(`script[data-frontier-ga="${measurementId}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      script.dataset.frontierGa = measurementId;
      document.head.appendChild(script);
    }

    const updateConsent = () => {
      analyticsWindow.gtag?.('consent', 'update', {
        analytics_storage: analyticsStorageGranted() ? 'granted' : 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    };

    window.addEventListener('frontier-consent-changed', updateConsent);
    return () => window.removeEventListener('frontier-consent-changed', updateConsent);
  }, []);

  return null;
}
