'use client';

import { useEffect } from 'react';

export function recordCommercialEvent(eventName: string, productSlug?: string) {
  if(localStorage.getItem('frontier-analytics-consent')!=='granted'||navigator.doNotTrack==='1'||(navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl) return;
  const query = new URLSearchParams(window.location.search);
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.('event', eventName, { product_slug: productSlug || undefined, page_path: window.location.pathname });
  void fetch('/api/commercial-events', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
    body: JSON.stringify({ consent:true, eventName, productSlug, pagePath: window.location.pathname, referrer: document.referrer, utmSource: query.get('utm_source'), utmMedium: query.get('utm_medium'), utmCampaign: query.get('utm_campaign') }),
  }).catch(()=>{});
}

export default function CommercialEvent({ name, productSlug }: { name: string; productSlug?: string }) {
  useEffect(() => { recordCommercialEvent(name, productSlug); }, [name, productSlug]);
  return null;
}
