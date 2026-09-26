'use client';

import { useEffect, useState } from 'react';

type PrivacyNavigator = Navigator & { globalPrivacyControl?: boolean };

function privacySignalActive() {
  return navigator.doNotTrack === '1' || Boolean((navigator as PrivacyNavigator).globalPrivacyControl);
}

function clearGaCookies() {
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0]?.trim();
    if (!name?.startsWith('_ga')) continue;
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.${window.location.hostname.replace(/^www\./, '')}; SameSite=Lax`;
  }
}

export default function AnalyticsPreferences() {
  const [gaGranted, setGaGranted] = useState(false);
  const [firstPartyEnabled, setFirstPartyEnabled] = useState(true);
  const [privacySignal, setPrivacySignal] = useState(false);

  useEffect(() => {
    const signal = privacySignalActive();
    setPrivacySignal(signal);
    setGaGranted(!signal && localStorage.getItem('frontier-analytics-consent') === 'granted');
    setFirstPartyEnabled(!signal && localStorage.getItem('frontier-first-party-opt-out') !== '1');
  }, []);

  const changeGoogleAnalytics = (granted: boolean) => {
    localStorage.setItem('frontier-analytics-consent', granted ? 'granted' : 'denied');
    if (!granted) clearGaCookies();
    setGaGranted(granted && !privacySignal);
    window.dispatchEvent(new Event('frontier-consent-changed'));
  };

  const changeFirstParty = (enabled: boolean) => {
    localStorage.setItem('frontier-first-party-opt-out', enabled ? '0' : '1');
    if (!enabled) sessionStorage.removeItem('frontier-visitor-session');
    setFirstPartyEnabled(enabled && !privacySignal);
    window.dispatchEvent(new Event('frontier-first-party-analytics-changed'));
  };

  return (
    <div className="my-5 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
      {privacySignal && <p className="text-sm font-semibold text-slate-700">Your browser privacy signal is active, so site analytics are disabled.</p>}

      <div>
        <p className="font-semibold text-slate-900">Frontier first-party usage measurement</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          {firstPartyEnabled ? 'Enabled' : 'Disabled'}. This privacy-minimized measurement uses a session-only anonymous identifier to count page views, traffic source and approximate country/city. It is not used for advertising or cross-site profiling.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <button type="button" disabled={privacySignal} className="font-semibold text-blue-700 underline disabled:text-slate-400" onClick={() => changeFirstParty(true)}>Enable first-party measurement</button>
          <button type="button" className="font-semibold text-slate-700 underline" onClick={() => changeFirstParty(false)}>Opt out</button>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <p className="font-semibold text-slate-900">Google Analytics storage</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          {gaGranted ? 'Analytics storage is allowed.' : 'Cookieless measurement only.'} GA4 starts with analytics storage denied. Allowing storage lets Google Analytics use its first-party analytics identifiers for fuller session measurement.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <button type="button" disabled={privacySignal} className="font-semibold text-blue-700 underline disabled:text-slate-400" onClick={() => changeGoogleAnalytics(true)}>Allow GA analytics storage</button>
          <button type="button" className="font-semibold text-slate-700 underline" onClick={() => changeGoogleAnalytics(false)}>Use cookieless measurement only</button>
        </div>
      </div>
    </div>
  );
}
