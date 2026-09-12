import type { Metadata } from 'next';
import Link from 'next/link';
import { BriefcaseBusiness, CheckCircle2, ShieldCheck } from 'lucide-react';
import AcquisitionLink from '@/components/AcquisitionLink';
import AppArtwork from '@/components/AppArtwork';
import ProjectArtwork from '@/components/ProjectArtwork';
import { compactSummary } from '@/lib/application-presentation';
import { caseStudyAcquisitionEnabled, listCaseStudies, type CaseStudy } from '@/lib/case-studies';
import type { AppRecord } from '@/lib/apps';
import type { Project } from '@/lib/projects';

export const dynamic = 'force-dynamic';
const description = 'Evidence-driven software, embedded systems, AI, web, and mobile engineering case studies from Frontier DevConsults in Accra, Ghana.';
export const metadata: Metadata = { title: 'Engineering Projects & Case Studies', description, alternates: { canonical: '/projects' }, openGraph: { title: 'Engineering Projects & Case Studies', description, url: '/projects', type: 'website' }, twitter: { card: 'summary_large_image', title: 'Engineering Projects & Case Studies', description } };

export default async function ProjectsPage() {
  let caseStudies: Awaited<ReturnType<typeof listCaseStudies>> = [];
  try { caseStudies = await listCaseStudies(false); } catch (error) { console.error('Public case studies fetch failed:', error); }
  return <main className="min-h-screen bg-gray-50">
    <section className="bg-gradient-to-br from-slate-950 to-blue-900 py-20 text-white"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><p className="font-bold uppercase tracking-[0.18em] text-blue-300">Selected engineering work</p><h1 className="mt-4 text-4xl font-bold sm:text-5xl">Projects &amp; Case Studies</h1><p className="mt-5 max-w-3xl text-xl leading-8 text-slate-200">Concise, evidence-controlled accounts of the problems, decisions, capabilities, and verified results behind our work.</p></div></section>
    <section className="py-14"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{caseStudies.length === 0 ? <Empty /> : <div className="grid gap-7 md:grid-cols-2">{caseStudies.map((item) => <CaseStudyCard key={item.id} item={item} />)}</div>}</div></section>
  </main>;
}

function CaseStudyCard({ item }: { item: CaseStudy }) {
  const name = sourceName(item); const technology = [...new Set(Object.values(item.technologyArchitecture).flat())].slice(0, 5);
  return <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="flex gap-4"><SourceArtwork item={item} /><div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">{item.ownershipType === 'frontier_product' ? 'Frontier-owned product' : 'Client-built project'}</p><h2 className="mt-1 text-2xl font-bold text-gray-950">{name}</h2><p className="mt-1 text-sm font-semibold text-gray-600">{item.source.category} · {item.projectStatus || sourceLifecycle(item)}</p></div></div>
    <p className="mt-5 leading-7 text-gray-700">{compactSummary(item.executiveSummary, 300)}</p>
    {item.capabilities.length > 0 && <ul className="mt-5 space-y-2">{item.capabilities.slice(0, 5).map((capability) => <li key={capability} className="flex gap-2 text-sm text-gray-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />{capability}</li>)}</ul>}
    {technology.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{technology.map((value) => <span key={value} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{value}</span>)}</div>}
    <div className="mt-auto pt-6"><p className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600"><ShieldCheck className="h-4 w-4 text-green-700" /> {item.evidence.length} approved evidence {item.evidence.length === 1 ? 'item' : 'items'}</p><div className="flex flex-wrap gap-3"><Link href={`/projects/${encodeURIComponent(item.slug)}`} className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">View Case Study</Link><CommercialCta item={item} /></div></div>
  </article>;
}

function CommercialCta({ item }: { item: CaseStudy }) {
  if (caseStudyAcquisitionEnabled(item)) return <AcquisitionLink slug={(item.source as AppRecord).slug!} className="rounded-lg border border-blue-600 px-4 py-2 font-bold text-blue-700 hover:bg-blue-50">Explore acquisition</AcquisitionLink>;
  if (item.ownershipType === 'client_project') return <Link href={`/request-build?project=${encodeURIComponent(sourceName(item))}`} className="rounded-lg border border-blue-600 px-4 py-2 font-bold text-blue-700 hover:bg-blue-50">Request a similar build</Link>;
  return null;
}
function SourceArtwork({ item }: { item: CaseStudy }) { return item.sourceType === 'app' ? <AppArtwork app={item.source as AppRecord} variant="card" className="h-16 w-16 shrink-0 rounded-xl" /> : <ProjectArtwork title={(item.source as Project).title} src={(item.source as Project).logoUrl} className="h-16 w-16 shrink-0" />; }
function sourceName(item: CaseStudy) { return item.sourceType === 'app' ? (item.source as AppRecord).name : (item.source as Project).title; }
function sourceLifecycle(item: CaseStudy) { return item.sourceType === 'app' ? (item.source as AppRecord).lifecycle.replaceAll('_', ' ') : (item.source as Project).status; }
function Empty() { return <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center"><BriefcaseBusiness className="mx-auto h-10 w-10 text-gray-400" /><h2 className="mt-4 text-2xl font-bold text-gray-900">No published case studies yet</h2><p className="mt-2 text-gray-600">Approved case studies will appear here after publication.</p></div>; }
