'use client';

import { useEffect } from 'react';

export function recordCommercialEvent(eventName: string, productSlug?: string) {
  const query = new URLSearchParams(window.location.search);
  void fetch('/api/commercial-events', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
    body: JSON.stringify({ eventName, productSlug, pagePath: window.location.pathname, referrer: document.referrer, utmSource: query.get('utm_source'), utmMedium: query.get('utm_medium'), utmCampaign: query.get('utm_campaign') }),
  });
}

export default function CommercialEvent({ name, productSlug }: { name: string; productSlug?: string }) {
  useEffect(() => { recordCommercialEvent(name, productSlug); }, [name, productSlug]);
  return null;
}
