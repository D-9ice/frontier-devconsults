'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit3, Eye, EyeOff, Plus, Save, Smartphone, Trash2, X } from 'lucide-react';

type AppStatus = 'Published' | 'Development' | 'Planning';
type AppRecord = {
  id: string; name: string; slug: string | null; category: string; version: string; size: string | null; rating: number | null; downloads: string | null;
  description: string; features: string[]; requirements: string[]; iconUrl: string | null; screenshotUrls: string[]; videoUrl: string | null;
  playStoreLink: string | null; downloadLink: string | null; status: AppStatus; visibility: 'draft' | 'published'; featured: boolean; sortOrder: number;
};
type AppForm = Omit<AppRecord, 'id'>;
const emptyApp: AppForm = { name: '', slug: '', category: '', version: '', size: '', rating: null, downloads: '', description: '', features: [], requirements: [], iconUrl: '', screenshotUrls: [], videoUrl: '', playStoreLink: '', downloadLink: '', status: 'Planning', visibility: 'draft', featured: false, sortOrder: 0 };
const statuses: AppStatus[] = ['Published', 'Development', 'Planning'];

export default function AppStoreManagementPage() {
  const [apps, setApps] = useState<AppRecord[]>([]);
  const [form, setForm] = useState<AppForm>(emptyApp);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const stats = useMemo(() => ({ published: apps.filter((app) => app.visibility === 'published').length, development: apps.filter((app) => app.status === 'Development').length, featured: apps.filter((app) => app.featured).length }), [apps]);

  const loadApps = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/apps', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load apps.');
      setApps(data);
    } catch (error) { setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load apps.' }); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadApps(); }, []);

  const close = () => { setIsOpen(false); setEditingId(null); setForm(emptyApp); };
  const create = () => { setForm({ ...emptyApp, sortOrder: apps.length }); setEditingId(null); setNotice(null); setIsOpen(true); };
  const edit = (app: AppRecord) => { const { id, ...values } = app; setForm(values); setEditingId(id); setNotice(null); setIsOpen(true); };
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setNotice(null);
    try {
      const response = await fetch(editingId ? `/api/admin/apps/${editingId}` : '/api/admin/apps', { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to save app.');
      await loadApps(); close(); setNotice({ type: 'success', text: editingId ? 'App updated.' : 'App created.' });
    } catch (error) { setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to save app.' }); }
    finally { setSaving(false); }
  };
  const remove = async (app: AppRecord) => {
    if (!window.confirm(`Delete ${app.name}? This cannot be undone.`)) return;
    try { const response = await fetch(`/api/admin/apps/${app.id}`, { method: 'DELETE' }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to delete app.'); setApps((items) => items.filter((item) => item.id !== app.id)); setNotice({ type: 'success', text: 'App deleted.' }); }
    catch (error) { setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to delete app.' }); }
  };

  return <main className="min-h-screen bg-gray-50"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <Link href="/admin/dashboard" className="mb-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"><ArrowLeft className="h-4 w-4" />Back to Dashboard</Link>
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold text-gray-900">Manage App Store</h1><p className="mt-2 text-gray-600">Create, publish, edit, and remove application listings.</p></div><div className="flex gap-3"><Link href="/app-store" className="inline-flex items-center justify-center rounded-lg border border-blue-600 px-4 py-3 font-semibold text-blue-600 hover:bg-blue-50">View App Store</Link><button onClick={create} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"><Plus className="h-5 w-5" />Add App</button></div></div>
    {notice && <div className={`mb-6 rounded-lg border p-4 ${notice.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{notice.text}</div>}
    <div className="mb-8 grid gap-4 sm:grid-cols-3"><Stat label="Published" value={stats.published} color="text-green-600" /><Stat label="In Development" value={stats.development} color="text-blue-600" /><Stat label="Featured" value={stats.featured} color="text-purple-600" /></div>
    {isOpen && <AppEditor form={form} setForm={setForm} editing={Boolean(editingId)} saving={saving} onClose={close} onSubmit={submit} />}
    <section className="overflow-hidden rounded-lg bg-white shadow-sm"><div className="border-b border-gray-200 p-6"><h2 className="text-xl font-bold text-gray-900">All Apps</h2></div>{loading ? <p className="p-8 text-gray-600">Loading apps...</p> : apps.length === 0 ? <div className="p-12 text-center"><Smartphone className="mx-auto mb-4 h-12 w-12 text-gray-300" /><h3 className="font-semibold text-gray-900">No apps yet</h3><p className="mt-2 text-gray-600">Add an app to begin managing the public App Store.</p></div> : <div className="divide-y divide-gray-100">{apps.map((app) => <AppRow key={app.id} app={app} onEdit={() => edit(app)} onDelete={() => remove(app)} />)}</div>}</section>
  </div></main>;
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) { return <div className="rounded-lg bg-white p-5 shadow-sm"><p className="text-sm text-gray-600">{label}</p><p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p></div>; }
function AppRow({ app, onEdit, onDelete }: { app: AppRecord; onEdit: () => void; onDelete: () => void }) { return <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 items-center gap-4">{app.iconUrl ? <img src={app.iconUrl} alt="" className="h-12 w-12 rounded object-contain" /> : <div className="flex h-12 w-12 items-center justify-center rounded bg-blue-50 text-blue-600"><Smartphone className="h-6 w-6" /></div>}<div className="min-w-0"><p className="truncate font-bold text-gray-900">{app.name}</p><p className="text-sm text-gray-600">{app.category} · v{app.version} · order {app.sortOrder}</p></div></div><div className="flex flex-wrap items-center gap-3"><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${app.visibility === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{app.visibility === 'published' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}{app.visibility}</span><button onClick={onEdit} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" aria-label={`Edit ${app.name}`}><Edit3 className="h-4 w-4" /></button><button onClick={onDelete} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50" aria-label={`Delete ${app.name}`}><Trash2 className="h-4 w-4" /></button></div></div>; }
function AppEditor({ form, setForm, editing, saving, onClose, onSubmit }: { form: AppForm; setForm: (value: AppForm) => void; editing: boolean; saving: boolean; onClose: () => void; onSubmit: (event: FormEvent) => void }) { const update = <K extends keyof AppForm>(key: K, value: AppForm[K]) => setForm({ ...form, [key]: value }); return <section className="mb-8 rounded-lg bg-white p-6 shadow-sm"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-bold text-gray-900">{editing ? 'Edit App' : 'New App'}</h2><button onClick={onClose} className="rounded p-2 text-gray-500 hover:bg-gray-100" aria-label="Close editor"><X className="h-5 w-5" /></button></div><form onSubmit={onSubmit} className="space-y-5"><div className="grid gap-5 md:grid-cols-2"><Text label="App Name" value={form.name} onChange={(value) => update('name', value)} required /><Text label="Slug (optional)" value={form.slug || ''} onChange={(value) => update('slug', value)} /><Text label="Category" value={form.category} onChange={(value) => update('category', value)} required /><Text label="Version" value={form.version} onChange={(value) => update('version', value)} required /></div><div className="grid gap-5 md:grid-cols-4"><Text label="Size" value={form.size || ''} onChange={(value) => update('size', value)} /><NumberField label="Rating (0-5)" value={form.rating} onChange={(value) => update('rating', value)} /><Text label="Downloads" value={form.downloads || ''} onChange={(value) => update('downloads', value)} /><NumberField label="Sort Order" value={form.sortOrder} onChange={(value) => update('sortOrder', value ?? 0)} /></div><div className="grid gap-5 md:grid-cols-3"><Select label="Status" value={form.status} options={statuses} onChange={(value) => update('status', value as AppStatus)} /><Select label="Visibility" value={form.visibility} options={['draft', 'published']} onChange={(value) => update('visibility', value as AppForm['visibility'])} /><label className="flex items-end gap-3 pb-3 text-sm font-semibold text-gray-700"><input type="checkbox" checked={form.featured} onChange={(event) => update('featured', event.target.checked)} className="h-4 w-4" />Feature on public page</label></div><TextArea label="Description" value={form.description} onChange={(value) => update('description', value)} required /><div className="grid gap-5 md:grid-cols-2"><TextArea label="Features (one per line)" value={form.features.join('\n')} onChange={(value) => update('features', splitLines(value))} /><TextArea label="Requirements (one per line)" value={form.requirements.join('\n')} onChange={(value) => update('requirements', splitLines(value))} /></div><div className="grid gap-5 md:grid-cols-2"><Text label="App Icon URL" value={form.iconUrl || ''} onChange={(value) => update('iconUrl', value)} /><Text label="Video URL (optional)" value={form.videoUrl || ''} onChange={(value) => update('videoUrl', value)} /><TextArea label="Screenshot URLs (one per line)" value={form.screenshotUrls.join('\n')} onChange={(value) => update('screenshotUrls', splitLines(value))} /><div className="grid gap-5"><Text label="Play Store URL" value={form.playStoreLink || ''} onChange={(value) => update('playStoreLink', value)} /><Text label="Direct Download URL" value={form.downloadLink || ''} onChange={(value) => update('downloadLink', value)} /></div></div><div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">Cancel</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Saving...' : editing ? 'Save App' : 'Create App'}</button></div></form></section>; }
function Text({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="block text-sm font-semibold text-gray-700">{label}<input required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900" /></label>; }
function TextArea({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="block text-sm font-semibold text-gray-700">{label}<textarea required={required} rows={4} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900" /></label>; }
function NumberField({ label, value, onChange }: { label: string; value: number | null; onChange: (value: number | null) => void }) { return <label className="block text-sm font-semibold text-gray-700">{label}<input min="0" max={label.startsWith('Rating') ? '5' : undefined} type="number" value={value ?? ''} onChange={(event) => onChange(event.target.value === '' ? null : Number(event.target.value))} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900" /></label>; }
function Select({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) { return <label className="block text-sm font-semibold text-gray-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900">{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function splitLines(value: string) { return value.split('\n').map((item) => item.trim()).filter(Boolean); }
