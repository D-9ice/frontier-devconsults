'use client';

import Link from 'next/link';
import { ExternalLink, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PublicAppCard } from '@/lib/public-apps';
import { availabilityLabel, lifecycleLabel, solutionKindLabel } from '@/lib/application-presentation';
import AppArtwork from '@/components/AppArtwork';
import AcquisitionLink from '@/components/AcquisitionLink';
import { filterApplications, resultCountLabel } from '@/lib/application-filters';

export default function AppCatalogue({ apps }: { apps: PublicAppCard[] }) {
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('all');
  const [lifecycle, setLifecycle] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [category, setCategory] = useState('all');
  const [commercial, setCommercial] = useState('all');
  const queryReady = useRef(false);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setSearch(query.get('q') || ''); setKind(query.get('kind') || 'all'); setLifecycle(query.get('lifecycle') || 'all');
    setAvailability(query.get('availability') || 'all'); setCategory(query.get('category') || 'all'); setCommercial(query.get('commercial') || 'all');
    queryReady.current = true;
  }, []);
  useEffect(() => {
    if (!queryReady.current) return;
    const url = new URL(window.location.href);
    const values = { q: search, kind, lifecycle, availability, category, commercial };
    Object.entries(values).forEach(([key, value]) => value && value !== 'all' ? url.searchParams.set(key, value) : url.searchParams.delete(key));
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, [search, kind, lifecycle, availability, category, commercial]);
  const filtered = useMemo(() => filterApplications(apps, { search, kind, lifecycle, availability, category, commercial }), [apps, search, kind, lifecycle, availability, category, commercial]);
  const reset = () => { setSearch(''); setKind('all'); setLifecycle('all'); setAvailability('all'); setCategory('all'); setCommercial('all'); };
  const categories = Array.from(new Set(apps.map((app) => app.category))).sort();
  const commercialOptions = Array.from(new Set(apps.flatMap((app) => app.commercialLabels))).sort();
  return <>
    <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="relative"><span className="sr-only">Search products and solutions</span><Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, technology, or industry" className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3" /></label>
        <Filter label="Product category" value={category} onChange={setCategory} options={categories} formatter={(value) => value} allLabel="All categories" />
        <Filter label="Solution kind" value={kind} onChange={setKind} options={Array.from(new Set(apps.map((app) => app.solutionKind)))} formatter={solutionKindLabel} allLabel="All solution kinds" />
        <Filter label="Development stage" value={lifecycle} onChange={setLifecycle} options={Array.from(new Set(apps.map((app) => app.lifecycle)))} formatter={(value) => lifecycleLabel(value)} allLabel="All development stages" />
        <Filter label="Availability" value={availability} onChange={setAvailability} options={Array.from(new Set(apps.map((app) => app.availability)))} formatter={availabilityLabel} allLabel="All availability options" />
        <Filter label="Commercial option" value={commercial} onChange={setCommercial} options={commercialOptions} formatter={(value) => value} allLabel="All commercial options" />
      </div>
      <div className="mt-4 flex items-center justify-between gap-4"><p className="text-sm text-gray-600" role="status" aria-live="polite" aria-atomic="true">{resultCountLabel(filtered.length)}</p><button type="button" onClick={reset} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">Reset filters</button></div>
    </div>
    {filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center"><h2 className="text-xl font-bold text-gray-900">No matching solutions</h2><p className="mt-2 text-gray-600">Try a broader search or reset the filters.</p></div> : <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{filtered.map((app) => <AppCard key={app.id} app={app} />)}</div>}
  </>;
}

function Filter({ label, value, onChange, options, formatter, allLabel }: { label: string; value: string; onChange: (value: string) => void; options: string[]; formatter: (value: any) => string; allLabel: string }) { return <label><span className="sr-only">{label}</span><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5"><option value="all">{allLabel}</option>{options.map((option) => <option key={option} value={option}>{formatter(option)}</option>)}</select></label>; }

export function AppCard({ app }: { app: PublicAppCard }) {
  const { cta, name } = app;
  const detailHref = app.slug ? `/app-store/${encodeURIComponent(app.slug)}` : null;
  return <article data-app-card={app.slug || app.id} className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
    <div className="flex gap-4"><AppArtwork name={name} src={app.artworkUrl} /><div className="min-w-0"><h2 className="text-xl font-bold text-gray-900">{detailHref ? <Link href={detailHref} className="hover:text-blue-700">{name}</Link> : name}</h2><p className="mt-1 text-sm font-semibold text-blue-700">{app.solutionKindLabel} · {app.category}</p><div className="mt-2 flex flex-wrap gap-2"><Badge>{app.developmentStatusLabel}</Badge><Badge subtle>{app.availabilityLabel}</Badge></div></div></div>
    {app.tagline && <p className="mt-5 font-semibold text-gray-900">{app.tagline}</p>}<p className="mt-3 text-gray-700">{app.summary}</p>
    {app.completionPercentage !== null && <div className="mt-5"><div className="mb-1 flex justify-between text-sm font-semibold text-gray-700"><span>Engineering progress</span><span>{app.completionPercentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-blue-600" style={{ width: `${app.completionPercentage}%` }} /></div></div>}
    {app.commercialLabels.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{app.commercialLabels.slice(0, 3).map((label) => <span key={label} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">{label}</span>)}</div>}
    {app.commercialByEnquiry && <p className="mt-4 text-sm font-semibold text-gray-700">Commercial terms by enquiry</p>}
    <div className="mt-auto flex flex-wrap gap-3 pt-6">{detailHref && <Link href={detailHref} className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700">View Product</Link>}{app.acquisitionEnabled && app.slug && <AcquisitionLink slug={app.slug} className="inline-flex items-center rounded-lg border border-blue-600 px-4 py-2.5 font-semibold text-blue-700 hover:bg-blue-50">Acquire Application</AcquisitionLink>}{!detailHref && cta && cta.external && <a href={cta.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700">{cta.label}<ExternalLink className="h-4 w-4" aria-hidden="true" /></a>}</div>
  </article>;
}
function Badge({ children, subtle = false }: { children: React.ReactNode; subtle?: boolean }) { return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${subtle ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-800'}`}>{children}</span>; }
