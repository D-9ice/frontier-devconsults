'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Choice = 'granted' | 'denied' | null;

function privacySignalActive() {
  return navigator.doNotTrack === '1' || Boolean((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl);
}

export default function AnalyticsConsentBanner() {
  const [choice, setChoice] = useState<Choice>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (privacySignalActive()) {
      localStorage.setItem('frontier-analytics-consent', 'denied');
      setChoice('denied');
    } else {
      const stored = localStorage.getItem('frontier-analytics-consent');
      setChoice(stored === 'granted' || stored === 'denied' ? stored : null);
    }
    setReady(true);
  }, []);

  const choose = (value: Exclude<Choice, null>) => {
    localStorage.setItem('frontier-analytics-consent', value);
    if (value === 'denied') sessionStorage.removeItem('frontier-visitor-session');
    setChoice(value);
    window.dispatchEvent(new Event('frontier-consent-changed'));
  };

  if (!ready || choice !== null) return null;

  return <aside className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-2xl" aria-label="Analytics preference">
    <p className="text-sm leading-6">Allow optional analytics to help Frontier DevConsults understand page visits, traffic sources and product interest. If Google Analytics 4 is configured, it uses the same consent choice. <Link href="/privacy" className="font-semibold text-blue-700 underline">Privacy details</Link>.</p>
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" onClick={() => choose('granted')} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800">Allow analytics</button>
      <button type="button" onClick={() => choose('denied')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">No thanks</button>
    </div>
  </aside>;
}
