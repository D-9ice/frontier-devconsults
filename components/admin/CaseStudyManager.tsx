'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, ExternalLink, Plus, Save, Trash2 } from 'lucide-react';
import { MediaUpload } from '@/components/admin/media-upload';

type Source = { id: string; title?: string; name?: string; slug?: string | null };
type Evidence = {
  id: string; title: string; description: string; type: string; sourceUrl: string | null; date: string | null;
  status: string; attribution: string | null; clientAttribution: string | null; externalUrl: string | null;
  clientName?: string | null; clientCompany?: string | null; clientRole?: string | null; testimonialText?: string | null;
  testimonialDate?: string | null; publicationPermission: boolean; verificationState: 'unverified' | 'verified';
};
type CaseStudy = {
  id: string; projectId: string | null; appId: string | null; slug: string; ownershipType: string; commercialState: string;
  clientCommercialAuthorized: boolean; visibility: 'draft' | 'published'; executiveSummary: string; intendedMarket: string;
  engineeringResponsibility: string; problemOpportunity: string; objectives: string[]; challengesConstraints: string[];
  engineeringApproach: string; architecture: Record<string, string>; engineeringDecisions: Array<{ decision: string; reason: string; benefit: string }>;
  capabilities: string[]; problemsSolutions: Array<{ challenge: string; response: string; outcome: string }>; securityReliability: string[];
  performanceScalability: string; userExperience: string; technologyArchitecture: Record<string, string[]>; projectStatus: string;
  engineeringInsights: string; evidence: Evidence[]; sectionOrder: string[]; seoTitle: string; seoDescription: string;
  source: Source;
};
type Payload = Omit<CaseStudy, 'id' | 'source'>;

const evidenceTypes = ['screenshot', 'mobile_screenshot', 'desktop_screenshot', 'dashboard_screenshot', 'architecture_diagram', 'project_video', 'testimonial', 'performance_measurement', 'usage_traffic', 'launch_deployment_date', 'business_result', 'technical_validation', 'supporting_document', 'external_project_link', 'other'];
const evidenceStatuses = ['draft', 'pending_verification', 'verified', 'approved_for_publication', 'rejected', 'private'];
const sections = ['overview', 'problem', 'objectives', 'challenges', 'approach', 'architecture', 'decisions', 'capabilities', 'solutions', 'security', 'performance', 'ux', 'technology', 'gallery', 'results', 'status', 'insights'];
const commercialStates = ['available_for_acquisition', 'available_for_licensing', 'available_for_customization', 'partnership_available', 'not_currently_available', 'not_for_sale'];

function blank(sourceValue = ''): Payload & { sourceValue: string } {
  const [kind, id] = sourceValue.split(':');
  return {
    sourceValue, projectId: kind === 'project' ? id : null, appId: kind === 'app' ? id : null, slug: '', ownershipType: kind === 'app' ? 'frontier_product' : 'client_project',
    commercialState: kind === 'app' ? 'not_currently_available' : 'not_for_sale', clientCommercialAuthorized: false, visibility: 'draft', executiveSummary: '', intendedMarket: '',
    engineeringResponsibility: '', problemOpportunity: '', objectives: [], challengesConstraints: [], engineeringApproach: '', architecture: {}, engineeringDecisions: [],
    capabilities: [], problemsSolutions: [], securityReliability: [], performanceScalability: '', userExperience: '', technologyArchitecture: {}, projectStatus: '', engineeringInsights: '',
    evidence: [], sectionOrder: [...sections], seoTitle: '', seoDescription: '',
  };
}
const lines = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);
const lineText = (items: string[]) => items.join('\n');
const triples = (value: string, keys: string[]) => lines(value).map((row) => { const parts = row.split('|').map((item) => item.trim()); return Object.fromEntries(keys.map((key, index) => [key, parts[index] || ''])); });
const tripleText = (items: Array<Record<string, string>>, keys: string[]) => items.map((item) => keys.map((key) => item[key] || '').join(' | ')).join('\n');
const techText = (value: Record<string, string[]>) => Object.entries(value).map(([category, items]) => `${category}: ${items.join(', ')}`).join('\n');
const parseTech = (value: string) => Object.fromEntries(lines(value).flatMap((row) => { const split = row.indexOf(':'); return split > 0 ? [[row.slice(0, split).trim(), row.slice(split + 1).split(',').map((item) => item.trim()).filter(Boolean)]] : []; }));

export function CaseStudyManager() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [sources, setSources] = useState<{ projects: Source[]; apps: Source[] }>({ projects: [], apps: [] });
  const [editing, setEditing] = useState<CaseStudy | null>(null);
  const [form, setForm] = useState(blank());
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const response = await fetch('/api/admin/case-studies', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to load case studies.');
    setItems(data.caseStudies); setSources(data.sources);
  };
  useEffect(() => { void load().catch((error) => setNotice(error.message)); }, []);

  const used = useMemo(() => new Set(items.map((item) => item.projectId ? `project:${item.projectId}` : `app:${item.appId}`)), [items]);
  const edit = (item: CaseStudy) => { setEditing(item); setForm({ ...item, sourceValue: item.projectId ? `project:${item.projectId}` : `app:${item.appId}`, architecture: item.architecture || {}, technologyArchitecture: item.technologyArchitecture || {} }); setNotice(''); };
  const create = () => { setEditing(null); setForm(blank()); setNotice(''); };
  const changeSource = (value: string) => {
    const source = [...sources.projects.map((item) => ({ ...item, kind: 'project' })), ...sources.apps.map((item) => ({ ...item, kind: 'app' }))].find((item) => `${item.kind}:${item.id}` === value);
    const next = blank(value); if (source) { next.slug = (source.slug || source.title || source.name || '').toLowerCase().replace(/_/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
    setForm(next);
  };
  const save = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setNotice('');
    const raw = form as typeof form & { id?: string; source?: Source };
    const { sourceValue: _sourceValue, id: _id, source: _source, ...payload } = raw;
    try {
      const response = await fetch(editing ? `/api/admin/case-studies/${editing.id}` : '/api/admin/case-studies', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to save case study.');
      await load(); setEditing(data); setForm({ ...data, sourceValue: data.projectId ? `project:${data.projectId}` : `app:${data.appId}` }); setNotice('Case study saved.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Unable to save case study.'); } finally { setSaving(false); }
  };
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));
  const setEvidence = (index: number, patch: Partial<Evidence>) => set('evidence', form.evidence.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  const addEvidence = () => set('evidence', [...form.evidence, { id: crypto.randomUUID(), title: '', description: '', type: 'screenshot', sourceUrl: null, date: null, status: 'draft', attribution: null, clientAttribution: null, externalUrl: null, publicationPermission: false, verificationState: 'unverified' }]);
  const moveSection = (index: number, direction: number) => { const target = index + direction; if (target < 0 || target >= form.sectionOrder.length) return; const order = [...form.sectionOrder]; [order[index], order[target]] = [order[target], order[index]]; set('sectionOrder', order); };

  return <div className="mt-8 grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
    <aside className="self-start rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-6">
      <button type="button" onClick={create} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> New case study</button>
      <div className="mt-4 divide-y divide-gray-100">{items.map((item) => <button type="button" key={item.id} onClick={() => edit(item)} className={`w-full py-4 text-left ${editing?.id === item.id ? 'text-blue-700' : 'text-gray-800'}`}><span className="block font-semibold">{item.source.title || item.source.name}</span><span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">{item.visibility} · {item.ownershipType.replaceAll('_', ' ')}</span></button>)}</div>
    </aside>
    <form onSubmit={save} className="space-y-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
      {notice && <p role="status" className={`rounded-lg p-3 ${notice.includes('saved') ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-900'}`}>{notice}</p>}
      <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="mb-3 text-xl font-bold">Publication controls</legend>
        <Field label="Existing project or product"><select required disabled={Boolean(editing)} value={form.sourceValue} onChange={(event) => changeSource(event.target.value)} className="input"><option value="">Choose a source</option><optgroup label="Client/portfolio projects">{sources.projects.map((source) => <option key={source.id} value={`project:${source.id}`} disabled={used.has(`project:${source.id}`)}>{source.title}</option>)}</optgroup><optgroup label="Frontier products">{sources.apps.map((source) => <option key={source.id} value={`app:${source.id}`} disabled={used.has(`app:${source.id}`)}>{source.name}</option>)}</optgroup></select></Field>
        <Field label="Public slug"><input required value={form.slug} onChange={(event) => set('slug', event.target.value)} className="input" /></Field>
        <Field label="Ownership"><select value={form.ownershipType} onChange={(event) => { const ownership = event.target.value; setForm((current) => ({ ...current, ownershipType: ownership, commercialState: ownership === 'client_project' && !current.clientCommercialAuthorized ? 'not_for_sale' : current.commercialState })); }} className="input"><option value="frontier_product">Frontier-owned product</option><option value="client_project">Client-built project</option></select></Field>
        <Field label="Commercial state"><select value={form.commercialState} disabled={form.ownershipType === 'client_project' && !form.clientCommercialAuthorized} onChange={(event) => set('commercialState', event.target.value)} className="input">{commercialStates.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select></Field>
        {form.ownershipType === 'client_project' && <label className="sm:col-span-2 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4"><input type="checkbox" checked={form.clientCommercialAuthorized} onChange={(event) => setForm((current) => ({ ...current, clientCommercialAuthorized: event.target.checked, commercialState: event.target.checked ? current.commercialState : 'not_for_sale' }))} /><span><strong>Explicit client commercial authorization</strong><span className="block text-sm text-amber-900">Enable only when documented permission allows acquisition, licensing, or sale language.</span></span></label>}
        <Field label="Visibility"><select value={form.visibility} onChange={(event) => set('visibility', event.target.value as 'draft' | 'published')} className="input"><option value="draft">Draft / unpublished</option><option value="published">Published</option></select></Field>
        {editing && form.visibility === 'published' && <div className="self-end pb-3"><Link href={`/projects/${form.slug}`} target="_blank" className="inline-flex items-center gap-2 font-semibold text-blue-700">Preview public page <ExternalLink className="h-4 w-4" /></Link></div>}
      </fieldset>
      <Section title="Core engineering narrative">
        <Field label="Executive summary"><textarea required rows={4} value={form.executiveSummary} onChange={(event) => set('executiveSummary', event.target.value)} className="input" /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Intended market"><textarea rows={3} value={form.intendedMarket} onChange={(event) => set('intendedMarket', event.target.value)} className="input" /></Field><Field label="Project status"><textarea rows={3} value={form.projectStatus} onChange={(event) => set('projectStatus', event.target.value)} className="input" /></Field></div>
        <Field label="Engineering responsibility"><textarea rows={3} value={form.engineeringResponsibility} onChange={(event) => set('engineeringResponsibility', event.target.value)} className="input" /></Field>
        <Field label="Problem or opportunity"><textarea rows={4} value={form.problemOpportunity} onChange={(event) => set('problemOpportunity', event.target.value)} className="input" /></Field>
        <ListField label="Objectives — one per line" value={form.objectives} onChange={(value) => set('objectives', value)} />
        <ListField label="Challenges and constraints — one per line" value={form.challengesConstraints} onChange={(value) => set('challengesConstraints', value)} />
        <Field label="Engineering approach"><textarea rows={5} value={form.engineeringApproach} onChange={(event) => set('engineeringApproach', event.target.value)} className="input" /></Field>
      </Section>
      <Section title="Architecture and implementation">
        {['narrative', 'diagramUrl', 'frontend', 'backend', 'database', 'infrastructure', 'services', 'integrations'].map((key) => <Field key={key} label={key.replace(/([A-Z])/g, ' $1')}><textarea rows={key === 'narrative' ? 4 : 2} value={form.architecture[key] || ''} onChange={(event) => set('architecture', { ...form.architecture, [key]: event.target.value })} className="input" /></Field>)}
        <Field label="Engineering decisions — Decision | Reason | Benefit"><textarea rows={5} value={tripleText(form.engineeringDecisions, ['decision', 'reason', 'benefit'])} onChange={(event) => set('engineeringDecisions', triples(event.target.value, ['decision', 'reason', 'benefit']) as CaseStudy['engineeringDecisions'])} className="input" /></Field>
        <ListField label="Core capabilities — one per line" value={form.capabilities} onChange={(value) => set('capabilities', value)} />
        <Field label="Challenge responses — Challenge | Response | Verified outcome"><textarea rows={5} value={tripleText(form.problemsSolutions, ['challenge', 'response', 'outcome'])} onChange={(event) => set('problemsSolutions', triples(event.target.value, ['challenge', 'response', 'outcome']) as CaseStudy['problemsSolutions'])} className="input" /></Field>
        <ListField label="Security and reliability — one verified statement per line" value={form.securityReliability} onChange={(value) => set('securityReliability', value)} />
        <Field label="Performance and scalability"><textarea rows={4} value={form.performanceScalability} onChange={(event) => set('performanceScalability', event.target.value)} className="input" /></Field>
        <Field label="User experience"><textarea rows={4} value={form.userExperience} onChange={(event) => set('userExperience', event.target.value)} className="input" /></Field>
        <Field label="Technology categories — Category: item, item"><textarea rows={5} value={techText(form.technologyArchitecture)} onChange={(event) => set('technologyArchitecture', parseTech(event.target.value))} className="input" /></Field>
        <Field label="Engineering insights"><textarea rows={5} value={form.engineeringInsights} onChange={(event) => set('engineeringInsights', event.target.value)} className="input" /></Field>
      </Section>
      <Section title="Evidence and testimonials">
        <p className="text-sm text-gray-600">Only evidence marked “approved for publication” appears publicly. Testimonials additionally require supplied text, verification, and permission.</p>
        {form.evidence.map((item, index) => <EvidenceEditor key={item.id} item={item} index={index} onChange={(patch) => setEvidence(index, patch)} onRemove={() => set('evidence', form.evidence.filter((_, itemIndex) => itemIndex !== index))} />)}
        <button type="button" onClick={addEvidence} className="inline-flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-700"><Plus className="h-4 w-4" /> Add evidence</button>
      </Section>
      <Section title="Section order">{form.sectionOrder.map((section, index) => <div key={section} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2"><span className="capitalize">{section}</span><span><button type="button" aria-label={`Move ${section} up`} onClick={() => moveSection(index, -1)} className="p-2"><ArrowUp className="h-4 w-4" /></button><button type="button" aria-label={`Move ${section} down`} onClick={() => moveSection(index, 1)} className="p-2"><ArrowDown className="h-4 w-4" /></button></span></div>)}</Section>
      <Section title="Search presentation"><Field label="SEO title"><input maxLength={160} value={form.seoTitle} onChange={(event) => set('seoTitle', event.target.value)} className="input" /></Field><Field label="SEO description"><textarea maxLength={320} rows={3} value={form.seoDescription} onChange={(event) => set('seoDescription', event.target.value)} className="input" /></Field></Section>
      <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Save className="h-5 w-5" /> {saving ? 'Saving…' : 'Save case study'}</button>
    </form>
  </div>;
}

function EvidenceEditor({ item, index, onChange, onRemove }: { item: Evidence; index: number; onChange: (patch: Partial<Evidence>) => void; onRemove: () => void }) {
  const media = ['screenshot', 'mobile_screenshot', 'desktop_screenshot', 'dashboard_screenshot', 'architecture_diagram', 'project_video'].includes(item.type);
  return <fieldset className="space-y-4 rounded-xl border border-gray-200 p-4"><legend className="px-2 font-bold">Evidence {index + 1}</legend><div className="grid gap-4 sm:grid-cols-2"><Field label="Title"><input required value={item.title} onChange={(event) => onChange({ title: event.target.value })} className="input" /></Field><Field label="Type"><select value={item.type} onChange={(event) => onChange({ type: event.target.value })} className="input">{evidenceTypes.map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="Publication status"><select value={item.status} onChange={(event) => onChange({ status: event.target.value })} className="input">{evidenceStatuses.map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="Evidence date"><input type="date" value={item.date || ''} onChange={(event) => onChange({ date: event.target.value || null })} className="input" /></Field></div><Field label="Description"><textarea rows={3} value={item.description} onChange={(event) => onChange({ description: event.target.value })} className="input" /></Field>
    {media ? <MediaUpload label="Evidence media" bucket="project-media" kind={item.type === 'project_video' ? 'video' : 'image'} value={item.sourceUrl || ''} onChange={(value) => onChange({ sourceUrl: value || null })} /> : <Field label="Source URL"><input type="url" value={item.sourceUrl || ''} onChange={(event) => onChange({ sourceUrl: event.target.value || null })} className="input" /></Field>}
    <div className="grid gap-4 sm:grid-cols-2"><Field label="External project/document URL"><input type="url" value={item.externalUrl || ''} onChange={(event) => onChange({ externalUrl: event.target.value || null })} className="input" /></Field><Field label="Attribution"><input value={item.attribution || ''} onChange={(event) => onChange({ attribution: event.target.value || null })} className="input" /></Field></div>
    {item.type === 'testimonial' && <div className="space-y-4 rounded-lg bg-amber-50 p-4"><div className="grid gap-4 sm:grid-cols-3"><Field label="Client name"><input value={item.clientName || ''} onChange={(event) => onChange({ clientName: event.target.value || null })} className="input" /></Field><Field label="Company"><input value={item.clientCompany || ''} onChange={(event) => onChange({ clientCompany: event.target.value || null })} className="input" /></Field><Field label="Role"><input value={item.clientRole || ''} onChange={(event) => onChange({ clientRole: event.target.value || null })} className="input" /></Field></div><Field label="Supplied testimonial text"><textarea rows={4} value={item.testimonialText || ''} onChange={(event) => onChange({ testimonialText: event.target.value || null })} className="input" /></Field><div className="flex flex-wrap gap-5"><label><input type="checkbox" checked={item.publicationPermission} onChange={(event) => onChange({ publicationPermission: event.target.checked })} /> Publication permission recorded</label><label>Verification <select value={item.verificationState} onChange={(event) => onChange({ verificationState: event.target.value as Evidence['verificationState'] })} className="ml-2 rounded border p-1"><option value="unverified">Unverified</option><option value="verified">Verified</option></select></label></div></div>}
    <button type="button" onClick={onRemove} className="inline-flex items-center gap-2 text-sm font-semibold text-red-700"><Trash2 className="h-4 w-4" /> Remove evidence record</button></fieldset>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <fieldset className="space-y-4 border-t border-gray-200 pt-6"><legend className="mb-2 text-xl font-bold text-gray-900">{title}</legend>{children}</fieldset>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1 block text-sm font-semibold capitalize text-gray-800">{label}</span>{children}</label>; }
function ListField({ label, value, onChange }: { label: string; value: string[]; onChange: (value: string[]) => void }) { return <Field label={label}><textarea rows={4} value={lineText(value)} onChange={(event) => onChange(lines(event.target.value))} className="input" /></Field>; }
