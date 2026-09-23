'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
  Wrench,
} from 'lucide-react';

type ClientRecord = {
  id: string;
  name: string;
  site_url: string;
  contact_email: string;
  interval_months: number;
  last_service_at: string | null;
  next_service_at: string | null;
  status: string;
};

type Notice = {
  id: string;
  direction: 'frontier_to_client' | 'client_to_frontier';
  severity: 'info' | 'warning' | 'critical';
  subject: string;
  message: string;
  status: 'open' | 'acknowledged' | 'resolved';
  email_status: string;
  sync_status: string;
  sync_error?: string | null;
  acknowledged_at?: string | null;
  created_at: string;
};

type ServiceRecord = {
  id: string;
  service_reference: string;
  completed_at: string;
  summary: string;
  findings: string;
  work_performed: string;
  recommendations: string;
  next_due_at: string;
  sync_status: string;
  sync_error?: string | null;
};

type Dashboard = {
  client: ClientRecord;
  schedule: { code: string; label: string; daysUntil: number | null };
  notices: Notice[];
  records: ServiceRecord[];
  syncConfigured: boolean;
};

function dateInput(value: string | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

function humanDate(value: string | null | undefined) {
  if (!value) return 'Not recorded';
  return new Date(value).toLocaleDateString('en-GB');
}

function badge(value: string) {
  if (['synced', 'acknowledged', 'active'].includes(value)) return 'border-green-200 bg-green-50 text-green-800';
  if (['failed', 'critical'].includes(value)) return 'border-red-200 bg-red-50 text-red-800';
  if (['pending', 'warning', 'open'].includes(value)) return 'border-amber-200 bg-amber-50 text-amber-900';
  return 'border-gray-200 bg-gray-50 text-gray-700';
}

export default function ClientMaintenancePage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [lastServiceAt, setLastServiceAt] = useState('');
  const [nextDueAt, setNextDueAt] = useState('');

  const [noticeSeverity, setNoticeSeverity] = useState<'info' | 'warning' | 'critical'>('warning');
  const [noticeSubject, setNoticeSubject] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(true);

  const [completedAt, setCompletedAt] = useState('');
  const [summary, setSummary] = useState('');
  const [findings, setFindings] = useState('');
  const [workPerformed, setWorkPerformed] = useState('');
  const [recommendations, setRecommendations] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/client-maintenance', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to load client maintenance.');
      setData(payload);
      setLastServiceAt(dateInput(payload.client?.last_service_at));
      setNextDueAt(dateInput(payload.client?.next_service_at));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load client maintenance.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function action(payload: Record<string, unknown>, key: string) {
    setBusy(key);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/client-maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Maintenance action failed.');
      if (result.dashboard) {
        setData(result.dashboard);
        setLastServiceAt(dateInput(result.dashboard.client?.last_service_at));
        setNextDueAt(dateInput(result.dashboard.client?.next_service_at));
      }
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Maintenance action failed.');
      throw e;
    } finally {
      setBusy('');
    }
  }

  async function saveSchedule() {
    try {
      const result = await action({
        action: 'configure_schedule',
        lastServiceAt: lastServiceAt || '',
        nextDueAt: nextDueAt || '',
      }, 'schedule');
      setNotice(result.sync?.ok
        ? 'Quarterly schedule saved and synchronized to MacSunny.'
        : 'Schedule saved in Frontier. MacSunny synchronization still needs attention.');
    } catch {}
  }

  async function sendMaintenanceNotice() {
    if (!noticeSubject.trim() || !noticeMessage.trim()) return;
    try {
      const result = await action({
        action: 'send_notice',
        severity: noticeSeverity,
        subject: noticeSubject.trim(),
        message: noticeMessage.trim(),
        sendEmail,
      }, 'notice');
      setNoticeSubject('');
      setNoticeMessage('');
      setNotice(result.sync?.ok
        ? `Maintenance notice synchronized to MacSunny. Email status: ${result.emailStatus}.`
        : `Maintenance notice saved. MacSunny synchronization failed; email status: ${result.emailStatus}.`);
    } catch {}
  }

  async function completeService() {
    if (!completedAt) return;
    try {
      const result = await action({
        action: 'complete_service',
        completedAt,
        summary: summary.trim(),
        findings: findings.trim(),
        workPerformed: workPerformed.trim(),
        recommendations: recommendations.trim(),
      }, 'complete');
      setCompletedAt('');
      setSummary('');
      setFindings('');
      setWorkPerformed('');
      setRecommendations('');
      setNotice(result.sync?.ok
        ? `Service ${result.reference} recorded and synchronized. Next service: ${humanDate(result.nextDueAt)}.`
        : `Service ${result.reference} recorded in Frontier. MacSunny synchronization needs attention.`);
    } catch {}
  }

  async function resolveNotice(id: string) {
    try {
      await action({ action: 'resolve_notice', noticeId: id }, `resolve-${id}`);
      setNotice('Maintenance notice resolved.');
    } catch {}
  }

  const openNotices = useMemo(
    () => data?.notices.filter((item) => item.status !== 'resolved') || [],
    [data],
  );

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-black">Client Maintenance & Service Monitor</h1>
            <p className="mt-2 max-w-3xl text-gray-600">
              Frontier is the authoritative service record. MacSunny receives signed notices, schedule updates, and completed-service records.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading || Boolean(busy)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-bold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error ? <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div> : null}
        {notice ? <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">{notice}</div> : null}

        {loading ? (
          <p className="mt-8 text-gray-600">Loading client maintenance…</p>
        ) : data ? (
          <div className="mt-8 space-y-6">
            {!data.syncConfigured ? (
              <section className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <h2 className="font-bold">Secure synchronization is not active yet</h2>
                    <p className="mt-1 text-sm">
                      Add the same CLIENT_MAINTENANCE_SYNC_SECRET to both Frontier and MacSunny deployments before using live synchronization.
                    </p>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Client</p>
                <p className="mt-2 text-lg font-black">{data.client.name}</p>
                <p className="mt-1 text-sm text-gray-600">{data.client.site_url}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Service cycle</p>
                <p className="mt-2 text-lg font-black">Every {data.client.interval_months} months</p>
                <p className="mt-1 text-sm text-gray-600">Contractual preventive maintenance</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Last service</p>
                <p className="mt-2 text-lg font-black">{humanDate(data.client.last_service_at)}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Next service</p>
                <p className="mt-2 text-lg font-black">{humanDate(data.client.next_service_at)}</p>
                <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${
                  ['overdue', 'due', 'urgent'].includes(data.schedule.code)
                    ? 'border-red-200 bg-red-50 text-red-800'
                    : data.schedule.code === 'approaching' || data.schedule.code === 'setup_required'
                      ? 'border-amber-200 bg-amber-50 text-amber-900'
                      : 'border-green-200 bg-green-50 text-green-800'
                }`}>
                  {data.schedule.label}
                </span>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 h-6 w-6 text-blue-700" />
                <div>
                  <h2 className="text-xl font-black">Quarterly Maintenance Schedule</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Enter the actual last completed service date. Frontier will calculate the next due date exactly three calendar months later.
                    If no service has occurred yet, set the first contractual next-service date instead.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-bold text-gray-700">
                  Last completed service date
                  <input
                    type="date"
                    value={lastServiceAt}
                    onChange={(event) => setLastServiceAt(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
                  />
                </label>
                <label className="text-sm font-bold text-gray-700">
                  First / next service date
                  <input
                    type="date"
                    value={nextDueAt}
                    onChange={(event) => setNextDueAt(event.target.value)}
                    disabled={Boolean(lastServiceAt)}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal disabled:bg-gray-100"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => void saveSchedule()}
                disabled={busy === 'schedule' || (!lastServiceAt && !nextDueAt)}
                className="mt-4 rounded-lg bg-blue-700 px-5 py-2.5 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {busy === 'schedule' ? 'Saving…' : 'Save & Synchronize Schedule'}
              </button>
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-6 w-6 text-amber-700" />
                  <div>
                    <h2 className="text-xl font-black">Send Maintenance Notice</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Sends the same notice into MacSunny Services & Renewals and, when selected, by Frontier email.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    Priority
                    <select
                      value={noticeSeverity}
                      onChange={(event) => setNoticeSeverity(event.target.value as 'info' | 'warning' | 'critical')}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
                    >
                      <option value="info">Information</option>
                      <option value="warning">Attention required</option>
                      <option value="critical">Critical</option>
                    </select>
                  </label>
                  <label className="block text-sm font-bold text-gray-700">
                    Subject
                    <input
                      value={noticeSubject}
                      onChange={(event) => setNoticeSubject(event.target.value)}
                      maxLength={180}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
                      placeholder="e.g. Security maintenance required"
                    />
                  </label>
                  <label className="block text-sm font-bold text-gray-700">
                    Message
                    <textarea
                      value={noticeMessage}
                      onChange={(event) => setNoticeMessage(event.target.value)}
                      maxLength={3000}
                      rows={6}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <input type="checkbox" checked={sendEmail} onChange={(event) => setSendEmail(event.target.checked)} />
                    Also send through Frontier email
                  </label>
                  <button
                    type="button"
                    onClick={() => void sendMaintenanceNotice()}
                    disabled={busy === 'notice' || !noticeSubject.trim() || !noticeMessage.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-5 py-2.5 font-bold text-white hover:bg-amber-800 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {busy === 'notice' ? 'Sending…' : 'Send Notice'}
                  </button>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <Wrench className="mt-0.5 h-6 w-6 text-green-700" />
                  <div>
                    <h2 className="text-xl font-black">Record Completed Service</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Saving a completed service creates the permanent Frontier record and schedules the next service three calendar months later.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    Completed date
                    <input
                      type="date"
                      value={completedAt}
                      onChange={(event) => setCompletedAt(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
                    />
                  </label>
                  <label className="block text-sm font-bold text-gray-700">
                    Service summary
                    <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} maxLength={1500} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" />
                  </label>
                  <label className="block text-sm font-bold text-gray-700">
                    Findings
                    <textarea value={findings} onChange={(event) => setFindings(event.target.value)} rows={3} maxLength={3000} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" />
                  </label>
                  <label className="block text-sm font-bold text-gray-700">
                    Work performed
                    <textarea value={workPerformed} onChange={(event) => setWorkPerformed(event.target.value)} rows={3} maxLength={3000} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" />
                  </label>
                  <label className="block text-sm font-bold text-gray-700">
                    Recommendations
                    <textarea value={recommendations} onChange={(event) => setRecommendations(event.target.value)} rows={3} maxLength={3000} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" />
                  </label>
                  <button
                    type="button"
                    onClick={() => void completeService()}
                    disabled={busy === 'complete' || !completedAt}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 font-bold text-white hover:bg-green-800 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {busy === 'complete' ? 'Recording…' : 'Record Service Completed'}
                  </button>
                </div>
              </section>
            </div>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-violet-700" />
                <div>
                  <h2 className="text-xl font-black">Maintenance Notices</h2>
                  <p className="text-sm text-gray-600">{openNotices.length} currently open or acknowledged.</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {data.notices.length === 0 ? <p className="text-gray-500">No maintenance notices recorded.</p> : data.notices.map((item) => (
                  <article key={item.id} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${badge(item.severity)}`}>{item.severity}</span>
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${badge(item.status)}`}>{item.status}</span>
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${badge(item.sync_status)}`}>sync: {item.sync_status}</span>
                          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-bold text-gray-700">
                            {item.direction === 'frontier_to_client' ? 'Frontier → MacSunny' : 'MacSunny → Frontier'}
                          </span>
                        </div>
                        <h3 className="mt-2 font-black">{item.subject}</h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{item.message}</p>
                        <p className="mt-2 text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleString('en-GB')} · Email: {item.email_status}
                          {item.acknowledged_at ? ` · Acknowledged ${new Date(item.acknowledged_at).toLocaleString('en-GB')}` : ''}
                        </p>
                        {item.sync_error ? <p className="mt-1 text-xs text-red-700">{item.sync_error}</p> : null}
                      </div>
                      {item.status !== 'resolved' ? (
                        <button
                          type="button"
                          onClick={() => void resolveNotice(item.id)}
                          disabled={busy === `resolve-${item.id}`}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold hover:bg-gray-50 disabled:opacity-50"
                        >
                          {busy === `resolve-${item.id}` ? 'Resolving…' : 'Resolve'}
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">Completed Service History</h2>
              <p className="mt-1 text-sm text-gray-600">These are the authoritative Frontier maintenance records synchronized to MacSunny.</p>
              <div className="mt-5 space-y-3">
                {data.records.length === 0 ? <p className="text-gray-500">No completed service records yet.</p> : data.records.map((record) => (
                  <article key={record.id} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm font-black text-blue-800">{record.service_reference}</p>
                        <p className="mt-1 text-sm font-bold">Completed {humanDate(record.completed_at)}</p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${badge(record.sync_status)}`}>
                        sync: {record.sync_status}
                      </span>
                    </div>
                    {record.summary ? <p className="mt-3 text-sm text-gray-700"><strong>Summary:</strong> {record.summary}</p> : null}
                    {record.findings ? <p className="mt-2 text-sm text-gray-700"><strong>Findings:</strong> {record.findings}</p> : null}
                    {record.work_performed ? <p className="mt-2 text-sm text-gray-700"><strong>Work performed:</strong> {record.work_performed}</p> : null}
                    {record.recommendations ? <p className="mt-2 text-sm text-gray-700"><strong>Recommendations:</strong> {record.recommendations}</p> : null}
                    <p className="mt-3 text-xs font-bold text-gray-500">Next scheduled service: {humanDate(record.next_due_at)}</p>
                    {record.sync_error ? <p className="mt-1 text-xs text-red-700">{record.sync_error}</p> : null}
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
