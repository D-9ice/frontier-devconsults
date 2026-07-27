'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, History, LoaderCircle, Plus, Save, Trash2 } from 'lucide-react';
import { MediaUpload } from '@/components/admin/media-upload';

type MediaType = 'image' | 'video';
type OfficeMediaItem = { url: string; type: MediaType; posterUrl?: string };
type HeroMediaSettings = {
  desktopMediaUrl: string; desktopMediaType: MediaType; desktopPosterUrl: string;
  mobileMediaUrl: string; mobileMediaType: MediaType; mobilePosterUrl: string;
  officeMedia: OfficeMediaItem[]; altText: string; overlayStrength: number;
  desktopFocalPosition: string; mobileFocalPosition: string; enabled: boolean;
  revision: number; updatedAt: string | null;
};
type Revision = { id: string; settings: HeroMediaSettings; action: 'save' | 'restore'; createdAt: string };

const fallback: HeroMediaSettings = {
  desktopMediaUrl: '/images/frontier-hero.png', desktopMediaType: 'image', desktopPosterUrl: '',
  mobileMediaUrl: '/images/frontier-hero-mobile.png', mobileMediaType: 'image', mobilePosterUrl: '',
  officeMedia: [], altText: 'Frontier DevConsults office workspace', overlayStrength: 5,
  desktopFocalPosition: 'center 35%', mobileFocalPosition: 'center center', enabled: false, revision: 0, updatedAt: null,
};

function Preview({ url, type, posterUrl, alt, position }: { url: string; type: MediaType; posterUrl?: string; alt: string; position: string }) {
  return <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-slate-950">{type === 'video' ? <video src={url} poster={posterUrl} className="h-full w-full object-cover" style={{ objectPosition: position }} muted autoPlay loop playsInline /> : <img src={url} alt={alt} className="h-full w-full object-cover" style={{ objectPosition: position }} />}<div className="absolute inset-0 bg-slate-950/15" /></div>;
}

export default function HeroMediaPage() {
  const [form, setForm] = useState<HeroMediaSettings>(fallback);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/hero-media', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load hero media.');
      setForm(data.settings); setRevisions(data.revisions || []);
    } catch (error) { setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load hero media.' }); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const update = <K extends keyof HeroMediaSettings>(key: K, value: HeroMediaSettings[K]) => setForm((current) => ({ ...current, [key]: value }));
  const save = async () => {
    setSaving(true); setNotice(null);
    try {
      const response = await fetch('/api/admin/hero-media', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to save hero media.');
      setForm(data.settings); setNotice({ type: 'success', text: 'Hero and office media saved.' }); await load();
    } catch (error) { setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to save hero media.' }); }
    finally { setSaving(false); }
  };
  const restore = async (id: string) => {
    if (!window.confirm('Restore this saved version?')) return;
    try {
      const response = await fetch(`/api/admin/hero-media/revisions/${id}`, { method: 'PUT' }); const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to restore this revision.'); setForm(data.settings); setNotice({ type: 'success', text: 'Saved hero version restored.' }); await load();
    } catch (error) { setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Unable to restore this revision.' }); }
  };
  const addOfficeMedia = (type: MediaType, url: string) => update('officeMedia', [...form.officeMedia, { url, type }]);

  return <main className="min-h-screen bg-gray-50"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <Link href="/admin/dashboard" className="mb-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Link>
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold text-gray-900">Hero & Office Media</h1><p className="mt-2 text-gray-600">Manage the desktop and mobile homepage hero, plus office photos and videos.</p></div><button type="button" disabled={saving || loading} onClick={() => void save()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}{saving ? 'Saving...' : 'Save Media'}</button></div>
    {notice && <div className={`mb-6 rounded-lg border p-4 ${notice.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{notice.text}</div>}
    {loading ? <p className="text-gray-600">Loading media settings...</p> : <div className="space-y-8">
      <section className="rounded-lg bg-white p-6 shadow-sm"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-gray-900">Homepage Hero</h2><p className="mt-1 text-sm text-gray-600">Leave the switch off to keep the current built-in hero images active.</p></div><label className="inline-flex items-center gap-3 font-semibold text-gray-700"><input type="checkbox" checked={form.enabled} onChange={(event) => update('enabled', event.target.checked)} className="h-5 w-5" /> Use managed hero media</label></div>
        <div className="grid gap-8 lg:grid-cols-2"><HeroSlot title="Desktop hero" value={form.desktopMediaUrl} type={form.desktopMediaType} poster={form.desktopPosterUrl} alt={form.altText} position={form.desktopFocalPosition} onUrl={(value) => update('desktopMediaUrl', value)} onType={(value) => update('desktopMediaType', value)} onPoster={(value) => update('desktopPosterUrl', value)} onPosition={(value) => update('desktopFocalPosition', value)} /><HeroSlot title="Mobile hero" value={form.mobileMediaUrl} type={form.mobileMediaType} poster={form.mobilePosterUrl} alt={form.altText} position={form.mobileFocalPosition} onUrl={(value) => update('mobileMediaUrl', value)} onType={(value) => update('mobileMediaType', value)} onPoster={(value) => update('mobilePosterUrl', value)} onPosition={(value) => update('mobileFocalPosition', value)} /></div>
        <div className="mt-8 grid gap-5 md:grid-cols-2"><Field label="Accessible hero description" value={form.altText} onChange={(value) => update('altText', value)} /><label className="block text-sm font-semibold text-gray-700">Overlay strength: {form.overlayStrength}%<input className="mt-3 w-full" type="range" min="0" max="95" value={form.overlayStrength} onChange={(event) => update('overlayStrength', Number(event.target.value))} /></label></div>
      </section>
      <section className="rounded-lg bg-white p-6 shadow-sm"><div className="mb-6"><h2 className="text-xl font-bold text-gray-900">Office gallery</h2><p className="mt-1 text-sm text-gray-600">These items appear in the office showcase. Add images or short videos by dropping files onto the uploader.</p></div><div className="grid gap-5 lg:grid-cols-2"><MediaUpload label="Add office image" bucket="site-media" kind="image" value="" onChange={(url) => addOfficeMedia('image', url)} showEmptyState={false} /><MediaUpload label="Add office video" bucket="site-media" kind="video" value="" onChange={(url) => addOfficeMedia('video', url)} showEmptyState={false} /></div>{form.officeMedia.length > 0 && <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{form.officeMedia.map((item) => <div key={item.url} className="relative overflow-hidden rounded-lg border border-gray-200"><Preview url={item.url} type={item.type} posterUrl={item.posterUrl} alt="Office media preview" position="center" /><button type="button" onClick={() => update('officeMedia', form.officeMedia.filter((entry) => entry.url !== item.url))} className="absolute right-3 top-3 rounded-lg bg-white/95 p-2 text-red-600 shadow hover:bg-white" aria-label="Remove office media"><Trash2 className="h-4 w-4" /></button></div>)}</div>}</section>
      <section className="rounded-lg bg-white p-6 shadow-sm"><div className="mb-4 flex items-center gap-2"><History className="h-5 w-5 text-blue-600" /><h2 className="text-xl font-bold text-gray-900">Saved Versions</h2></div>{revisions.length === 0 ? <p className="text-gray-600">No saved versions yet.</p> : <div className="divide-y divide-gray-100">{revisions.map((revision) => <div key={revision.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold text-gray-900">Version {revision.settings.revision} · {revision.action}</p><p className="text-sm text-gray-600">{new Date(revision.createdAt).toLocaleString()}</p></div><button type="button" onClick={() => void restore(revision.id)} className="rounded-lg border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">Restore</button></div>)}</div>}</section>
    </div>}
  </div></main>;
}

function HeroSlot({ title, value, type, poster, alt, position, onUrl, onType, onPoster, onPosition }: { title: string; value: string; type: MediaType; poster: string; alt: string; position: string; onUrl: (value: string) => void; onType: (value: MediaType) => void; onPoster: (value: string) => void; onPosition: (value: string) => void }) {
  return <div className="space-y-4"><h3 className="font-bold text-gray-900">{title}</h3><Preview url={value} type={type} posterUrl={poster} alt={alt} position={position} /><label className="block text-sm font-semibold text-gray-700">Media type<select value={type} onChange={(event) => onType(event.target.value as MediaType)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900"><option value="image">Image</option><option value="video">Video</option></select></label><Field label="Media URL" value={value} onChange={onUrl} /><MediaUpload label={`Upload ${title.toLowerCase()} ${type}`} bucket="site-media" kind={type} value="" onChange={onUrl} showEmptyState={false} />{type === 'video' && <><Field label="Video poster URL (recommended)" value={poster} onChange={onPoster} /><MediaUpload label="Upload video poster" bucket="site-media" kind="image" value="" onChange={onPoster} showEmptyState={false} /></>}<Field label="Focal position" value={position} onChange={onPosition} help="Examples: center center, center 35%, 50% 20%." /></div>;
}

function Field({ label, value, onChange, help }: { label: string; value: string; onChange: (value: string) => void; help?: string }) { return <label className="block text-sm font-semibold text-gray-700">{label}<input value={value} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900" />{help && <span className="mt-1 block text-xs font-normal text-gray-500">{help}</span>}</label>; }
