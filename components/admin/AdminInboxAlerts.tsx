'use client';

import Link from 'next/link';
import { Bell, BellRing, Mail, MessageSquare, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type AlertData = {
  mailCount: number;
  mailLatest: string;
  contactPending: number;
  buildPending: number;
  contactLatest: string;
  buildLatest: string;
};
const empty: AlertData = { mailCount: 0, mailLatest: '', contactPending: 0, buildPending: 0, contactLatest: '', buildLatest: '' };

export default function AdminInboxAlerts() {
  const [data, setData] = useState(empty);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const baseline = useRef<Pick<AlertData, 'mailLatest' | 'contactLatest' | 'buildLatest'> | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(false);

  function chime() {
    const context = audio.current;
    if (!context) return;
    void context.resume().then(() => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(); oscillator.stop(context.currentTime + 0.36);
    }).catch(() => setError('This browser blocked the alert sound. Select Enable sound again.'));
  }

  useEffect(() => {
    let active = true;
    async function refresh() {
      if (document.visibilityState !== 'visible') return;
      try {
        const [dashboardResponse, mailResponse] = await Promise.all([
          fetch('/api/admin/dashboard', { cache: 'no-store' }),
          fetch('/api/admin/mail', { cache: 'no-store' }),
        ]);
        if (!dashboardResponse.ok || !mailResponse.ok) throw new Error('Inbox alerts are temporarily unavailable.');
        const dashboard = await dashboardResponse.json();
        const mail = await mailResponse.json();
        const contact = dashboard.recentActivity?.find((item: { type: string }) => item.type === 'contact');
        const build = dashboard.recentActivity?.find((item: { type: string }) => item.type === 'build');
        const current: AlertData = {
          mailCount: mail.messages?.length || 0,
          mailLatest: mail.messages?.[0]?.id || '',
          contactPending: dashboard.stats?.pendingContactSubmissions || 0,
          buildPending: dashboard.stats?.pendingBuildRequests || 0,
          contactLatest: contact?.id || '',
          buildLatest: build?.id || '',
        };
        if (!active) return;
        const previous = baseline.current;
        const changed: string[] = [];
        if (previous) {
          if (current.mailLatest && current.mailLatest !== previous.mailLatest) changed.push('business email');
          if (current.contactLatest && current.contactLatest !== previous.contactLatest) changed.push('contact message');
          if (current.buildLatest && current.buildLatest !== previous.buildLatest) changed.push('build request');
        }
        baseline.current = current;
        setData(current); setError('');
        if (changed.length) {
          const message = `New ${changed.join(', ')} received.`;
          setNotice(message);
          if (soundEnabledRef.current) chime();
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try { new Notification('Frontier DevConsults', { body: message, tag: 'frontier-admin-inbox' }); } catch { /* Visual and audible alerts remain active. */ }
          }
        }
      } catch (caught) { if (active) setError(caught instanceof Error ? caught.message : 'Inbox alerts are temporarily unavailable.'); }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  async function enableAlerts() {
    try {
      audio.current ||= new AudioContext();
      await audio.current.resume();
      soundEnabledRef.current = true; setSoundEnabled(true); chime();
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') await Notification.requestPermission();
    } catch { setError('This browser did not allow alert sound or desktop notifications. Visual reminders remain active.'); }
  }

  return <section className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-6 text-gray-900 shadow-sm" aria-labelledby="inbox-alerts-title">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 id="inbox-alerts-title" className="flex items-center gap-2 text-xl font-bold text-blue-950"><BellRing className="h-5 w-5" /> Inbox alerts &amp; reminders</h2><p className="mt-1 text-sm text-blue-900">Updates every 15 seconds while this dashboard is open.</p></div>
      <button type="button" onClick={() => void enableAlerts()} disabled={soundEnabled} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:bg-emerald-700"><Volume2 className="h-4 w-4" />{soundEnabled ? 'Sound enabled this session' : 'Enable sound & desktop alerts'}</button>
    </div>
    {notice && <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 font-semibold text-amber-950" role="status" aria-live="assertive"><Bell className="mr-2 inline h-4 w-4" />{notice}</p>}
    {error && <p className="mt-4 text-sm font-semibold text-red-800" role="alert">{error}</p>}
    <div className="mt-5 grid gap-4 md:grid-cols-3">
      <AlertCard href="/admin/mail" icon={<Mail />} title="Business Mail" count={data.mailCount} label="recent messages at Resend" />
      <AlertCard href="/admin/submissions" icon={<MessageSquare />} title="Send Us a Message" count={data.contactPending} label="awaiting response" urgent={data.contactPending > 0} />
      <AlertCard href="/admin/submissions" icon={<MessageSquare />} title="Request a Build" count={data.buildPending} label="awaiting response" urgent={data.buildPending > 0} />
    </div>
    <p className="mt-4 text-xs text-blue-900">Sound works only after you enable it and while this dashboard is open. Desktop alerts also depend on browser permission. Business Mail shows the current provider page, not an unread count.</p>
  </section>;
}

function AlertCard({ href, icon, title, count, label, urgent = false }: { href: string; icon: React.ReactNode; title: string; count: number; label: string; urgent?: boolean }) {
  return <Link href={href} className={`rounded-xl border p-4 transition-colors hover:border-blue-500 ${urgent ? 'border-amber-400 bg-amber-50' : 'border-blue-200 bg-white'}`}>
    <div className="flex items-center justify-between"><span className="flex items-center gap-2 font-bold text-gray-900">{icon}{title}</span><span className={`rounded-full px-3 py-1 text-lg font-bold ${urgent ? 'bg-amber-500 text-gray-950' : 'bg-blue-700 text-white'}`}>{count}</span></div>
    <p className="mt-2 text-sm font-medium text-gray-700">{label}</p>
  </Link>;
}
