'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LoaderCircle, RefreshCw, Save } from 'lucide-react';
import {
  consultationStatuses, feasibilityStatuses, specializedLabels,
  specializedProjectTypes, specializedStatuses,
} from '@/lib/specialized-options';

type RequestRecord = {
  id: string; reference_number: string; full_name: string; email: string; country: string;
  company: string | null; phone: string | null; website: string | null; job_title: string | null;
  project_types: string[]; current_system_state: string[]; project_description: string;
  equipment_type: string | null; operating_voltage: string | null; power_level: string | null;
  motor_type: string | null; battery_type: string | null; existing_controller: string | null;
  existing_communication_interface: string | null; sensor_count: string | null; device_count: string | null; environment: string | null;
  control_requirements: string[]; monitoring_requirements: string[]; interface_requirements: string[];
  connectivity_requirements: string[]; development_scope: string[]; timeline: string | null; budget_range: string | null;
  additional_information: string | null; status: string; internal_notes: string; assigned_follow_up: string | null;
  feasibility_status: string; consultation_status: string; utm_source: string | null; utm_medium: string | null;
  utm_campaign: string | null; utm_content: string | null; utm_term: string | null; referrer: string | null; landing_page: string | null;
  created_at: string; updated_at: string;
};

const humanize = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const displayList = (values: string[], labels?: Record<string, string>) => values.length ? values.map((value) => labels?.[value] || humanize(value)).join(', ') : 'Not specified';

export default function SpecializedRequestsAdminPage() {
  const [records, setRecords] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ q: '', status: 'all', projectType: '', country: '', from: '', to: '' });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    try {
      const response = await fetch(`/api/admin/specialized-requests?${params}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load requests.');
      setRecords(data);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Failed to load requests.'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { void load(); }, [load]);

  const updateLocal = (id: string, field: keyof RequestRecord, value: string) => setRecords((current) => current.map((record) => record.id === id ? { ...record, [field]: value } : record));
  const save = async (record: RequestRecord) => {
    setError('');
    const response = await fetch(`/api/admin/specialized-requests/${record.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: record.status, feasibilityStatus: record.feasibility_status, consultationStatus: record.consultation_status, assignedFollowUp: record.assigned_follow_up || '', internalNotes: record.internal_notes }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || 'Failed to save request.'); return; }
    setRecords((current) => current.map((item) => item.id === record.id ? data : item));
  };

  return (
    <main className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><Link href="/admin/dashboard" className="inline-flex items-center text-sm font-bold text-blue-700"><ArrowLeft className="mr-1 h-4 w-4" /> Dashboard</Link><h1 className="mt-3 text-3xl font-black text-slate-950">Specialized Engineering Requests</h1><p className="mt-1 text-slate-600">Technical intake, assessment, consultation, proposal, delivery, and archive workflow.</p></div><button onClick={() => void load()} className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 font-bold text-slate-800"><RefreshCw className="mr-2 h-4 w-4" />Refresh</button></div>

        <section className="mt-7 grid gap-3 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-6" aria-label="Request filters">
          <input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="Search" aria-label="Search requests" className="rounded-lg border border-slate-300 px-3 py-2" />
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} aria-label="Status" className="rounded-lg border border-slate-300 px-3 py-2"><option value="all">All statuses</option>{specializedStatuses.map((value) => <option key={value} value={value}>{humanize(value)}</option>)}</select>
          <select value={filters.projectType} onChange={(event) => setFilters({ ...filters, projectType: event.target.value })} aria-label="Project type" className="rounded-lg border border-slate-300 px-3 py-2"><option value="">All project types</option>{specializedProjectTypes.map((value) => <option key={value} value={value}>{specializedLabels.projectType[value]}</option>)}</select>
          <input value={filters.country} onChange={(event) => setFilters({ ...filters, country: event.target.value })} placeholder="Country" aria-label="Country" className="rounded-lg border border-slate-300 px-3 py-2" />
          <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} aria-label="From date" className="rounded-lg border border-slate-300 px-3 py-2" />
          <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} aria-label="To date" className="rounded-lg border border-slate-300 px-3 py-2" />
        </section>

        {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700" role="alert">{error}</div>}
        {loading ? <div className="flex items-center justify-center py-20 text-slate-600"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> Loading requests...</div> : records.length === 0 ? <div className="mt-6 rounded-2xl bg-white p-12 text-center text-slate-600">No matching specialized engineering requests.</div> : <div className="mt-6 space-y-6">{records.map((record) => (
          <article key={record.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap justify-between gap-5"><div><p className="font-mono text-sm font-bold text-blue-700">{record.reference_number}</p><h2 className="mt-1 text-2xl font-black">{record.full_name}{record.company ? ` · ${record.company}` : ''}</h2><p className="mt-1 text-slate-600"><a className="text-blue-700 underline" href={`mailto:${record.email}`}>{record.email}</a> · {record.phone || 'No phone'} · {record.country}</p><p className="mt-1 text-sm text-slate-500">Received {new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.created_at))}</p></div><span className="h-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800">{humanize(record.status)}</span></div>
            <div className="mt-6 rounded-xl bg-slate-50 p-5"><h3 className="font-bold">Project brief</h3><p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">{record.project_description}</p></div>
            <details className="mt-5 rounded-xl border border-slate-200 p-5"><summary className="cursor-pointer font-bold">Complete technical intake</summary><div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Project types" value={displayList(record.project_types, specializedLabels.projectType)} /><Detail label="Current state" value={displayList(record.current_system_state, specializedLabels.currentState)} /><Detail label="Development scope" value={displayList(record.development_scope, specializedLabels.scope)} />
              <Detail label="Control" value={displayList(record.control_requirements, specializedLabels.control)} /><Detail label="Monitoring" value={displayList(record.monitoring_requirements, specializedLabels.monitoring)} /><Detail label="Interfaces" value={displayList(record.interface_requirements, specializedLabels.interface)} /><Detail label="Connectivity" value={displayList(record.connectivity_requirements, specializedLabels.connectivity)} />
              <Detail label="Equipment" value={record.equipment_type} /><Detail label="Operating voltage" value={record.operating_voltage} /><Detail label="Power level" value={record.power_level} /><Detail label="Motor" value={record.motor_type} /><Detail label="Battery" value={record.battery_type} /><Detail label="Existing controller" value={record.existing_controller} /><Detail label="Existing communication" value={record.existing_communication_interface} /><Detail label="Sensors" value={record.sensor_count} /><Detail label="Devices" value={record.device_count} /><Detail label="Environment" value={record.environment} />
              <Detail label="Timeline" value={record.timeline ? specializedLabels.timeline[record.timeline as keyof typeof specializedLabels.timeline] : null} /><Detail label="Budget" value={record.budget_range ? specializedLabels.budget[record.budget_range as keyof typeof specializedLabels.budget] : null} /><Detail label="Job title" value={record.job_title} /><Detail label="Website" value={record.website} />
              <Detail label="Additional information" value={record.additional_information} /><Detail label="Landing page" value={record.landing_page} /><Detail label="Referrer" value={record.referrer} /><Detail label="UTM" value={[record.utm_source, record.utm_medium, record.utm_campaign, record.utm_content, record.utm_term].filter(Boolean).join(' / ') || null} />
            </div></details>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Select label="Status" value={record.status} values={specializedStatuses} onChange={(value) => updateLocal(record.id, 'status', value)} />
              <Select label="Feasibility" value={record.feasibility_status} values={feasibilityStatuses} onChange={(value) => updateLocal(record.id, 'feasibility_status', value)} />
              <Select label="Consultation" value={record.consultation_status} values={consultationStatuses} onChange={(value) => updateLocal(record.id, 'consultation_status', value)} />
              <label className="text-sm font-bold text-slate-700">Assigned follow-up<input value={record.assigned_follow_up || ''} onChange={(event) => updateLocal(record.id, 'assigned_follow_up', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
            </div>
            <label className="mt-4 block text-sm font-bold text-slate-700">Internal notes<textarea value={record.internal_notes} onChange={(event) => updateLocal(record.id, 'internal_notes', event.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
            <button onClick={() => void save(record)} className="mt-4 inline-flex items-center rounded-lg bg-blue-700 px-5 py-3 font-bold text-white"><Save className="mr-2 h-4 w-4" />Save workflow</button>
          </article>
        ))}</div>}
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) { return <div><dt className="font-bold text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-slate-800">{value || 'Not specified'}</dd></div>; }
function Select({ label, value, values, onChange }: { label: string; value: string; values: readonly string[]; onChange: (value: string) => void }) { return <label className="text-sm font-bold text-slate-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal">{values.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}</select></label>; }
