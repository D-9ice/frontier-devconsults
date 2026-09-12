import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AcquisitionLink from '@/components/AcquisitionLink';
import AppArtwork from '@/components/AppArtwork';
import ProjectArtwork from '@/components/ProjectArtwork';
import { caseStudyAcquisitionEnabled, getPublicCaseStudyBySlug, type CaseStudy, type CaseStudyEvidence } from '@/lib/case-studies';
import type { AppRecord } from '@/lib/apps';
import type { Project } from '@/lib/projects';
import { SITE_ORIGIN } from '@/lib/site-url';

type Props = { params: Promise<{ slug: string }> };
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getPublicCaseStudyBySlug((await params).slug).catch(() => null);
  if (!item) return { title: 'Case study not found', robots: { index: false, follow: false } };
  const name = sourceName(item); const title = item.seoTitle || `${name} Engineering Case Study`; const description = (item.seoDescription || item.executiveSummary).slice(0, 320); const url = `/projects/${item.slug}`; const image = approvedImage(item);
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: 'article', ...(image ? { images: [{ url: image }] } : {}) }, twitter: { card: 'summary_large_image', title, description, ...(image ? { images: [image] } : {}) } };
}

export default async function ProjectDetail({ params }: Props) {
  const item = await getPublicCaseStudyBySlug((await params).slug).catch(() => null); if (!item) notFound();
  const name = sourceName(item); const blocks = buildBlocks(item); const url = `${SITE_ORIGIN}/projects/${item.slug}`;
  const workSchema = item.sourceType === 'app' ? { '@type': 'SoftwareApplication', name, description: item.executiveSummary, applicationCategory: item.source.category, url, author: { '@type': 'Organization', name: 'Frontier DevConsults' } } : { '@type': 'CreativeWork', name, description: item.executiveSummary, url, creator: { '@type': 'Organization', name: 'Frontier DevConsults' } };
  const jsonLd = { '@context': 'https://schema.org', '@graph': [workSchema, { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN }, { '@type': 'ListItem', position: 2, name: 'Projects', item: `${SITE_ORIGIN}/projects` }, { '@type': 'ListItem', position: 3, name, item: url }] }] };
  return <main className="min-h-screen bg-gray-50">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    <section className="bg-slate-950 py-16 text-white"><div className="mx-auto max-w-5xl px-4 sm:px-6"><Link href="/projects" className="font-semibold text-blue-300 hover:text-white">← Projects &amp; Case Studies</Link><div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center"><SourceArtwork item={item} /><div><p className="font-semibold text-blue-300">{item.ownershipType === 'frontier_product' ? 'Frontier-owned product' : 'Client-built project'} · {item.source.category}</p><h1 className="mt-2 text-4xl font-bold sm:text-5xl">{name}</h1><p className="mt-2 capitalize text-slate-300">{item.projectStatus || sourceLifecycle(item)}</p></div></div><p className="mt-7 max-w-4xl text-lg leading-8 text-slate-200">{item.executiveSummary}</p></div></section>
    <article className="mx-auto max-w-5xl space-y-12 px-4 py-12 sm:px-6">{item.sectionOrder.flatMap((key) => blocks[key] ? [<div key={key}>{blocks[key]}</div>] : [])}<CallToAction item={item} /></article>
  </main>;
}

function buildBlocks(item: CaseStudy): Record<string, React.ReactNode | null> {
  const media = item.evidence.filter((evidence) => ['screenshot', 'mobile_screenshot', 'desktop_screenshot', 'dashboard_screenshot', 'architecture_diagram', 'project_video'].includes(evidence.type) && evidence.sourceUrl);
  const results = item.evidence.filter((evidence) => !media.includes(evidence));
  return {
    overview: item.intendedMarket || item.engineeringResponsibility ? <Block title="Project overview"><Definition label="Intended market" value={item.intendedMarket} /><Definition label="Engineering responsibility" value={item.engineeringResponsibility} /></Block> : null,
    problem: item.problemOpportunity ? <Block title="Problem or opportunity"><Text value={item.problemOpportunity} /></Block> : null,
    objectives: item.objectives.length ? <List title="Objectives" items={item.objectives} /> : null,
    challenges: item.challengesConstraints.length ? <List title="Challenges and constraints" items={item.challengesConstraints} /> : null,
    approach: item.engineeringApproach ? <Block title="Engineering approach"><Text value={item.engineeringApproach} /></Block> : null,
    architecture: Object.values(item.architecture).some(Boolean) ? <Block title="Architecture"><Definition label="Architecture narrative" value={item.architecture.narrative} /><div className="mt-5 grid gap-4 sm:grid-cols-2">{['frontend', 'backend', 'database', 'infrastructure', 'services', 'integrations'].map((key) => item.architecture[key as keyof typeof item.architecture] ? <Definition key={key} label={key} value={item.architecture[key as keyof typeof item.architecture]} card /> : null)}</div>{item.architecture.diagramUrl && <Image src={item.architecture.diagramUrl} alt={`${sourceName(item)} architecture diagram`} width={1400} height={900} className="mt-6 h-auto w-full rounded-xl border bg-white object-contain" />}</Block> : null,
    decisions: item.engineeringDecisions.length ? <Block title="Engineering decisions"><div className="grid gap-4">{item.engineeringDecisions.map((decision) => <div key={decision.decision} className="rounded-xl border border-gray-200 bg-white p-5"><h3 className="font-bold text-gray-950">{decision.decision}</h3>{decision.reason && <p className="mt-2"><strong>Reason:</strong> {decision.reason}</p>}{decision.benefit && <p className="mt-2"><strong>Engineering benefit:</strong> {decision.benefit}</p>}</div>)}</div></Block> : null,
    capabilities: item.capabilities.length ? <List title="Core capabilities" items={item.capabilities} /> : null,
    solutions: item.problemsSolutions.length ? <Block title="Challenge, response, outcome"><div className="grid gap-4">{item.problemsSolutions.map((row) => <div key={row.challenge} className="rounded-xl border border-gray-200 bg-white p-5"><h3 className="font-bold text-gray-950">{row.challenge}</h3>{row.response && <p className="mt-2"><strong>Response:</strong> {row.response}</p>}{row.outcome && <p className="mt-2"><strong>Verified outcome:</strong> {row.outcome}</p>}</div>)}</div></Block> : null,
    security: item.securityReliability.length ? <List title="Security and reliability" items={item.securityReliability} /> : null,
    performance: item.performanceScalability ? <Block title="Performance and scalability"><Text value={item.performanceScalability} /></Block> : null,
    ux: item.userExperience ? <Block title="User experience"><Text value={item.userExperience} /></Block> : null,
    technology: Object.keys(item.technologyArchitecture).length ? <Block title="Technology architecture"><div className="grid gap-4 sm:grid-cols-2">{Object.entries(item.technologyArchitecture).map(([category, values]) => <div key={category} className="rounded-xl bg-slate-100 p-5"><h3 className="font-bold text-gray-950">{category}</h3><p className="mt-2 text-gray-700">{values.join(' · ')}</p></div>)}</div></Block> : null,
    gallery: media.length ? <Block title="Approved project evidence"><div className="grid gap-5 sm:grid-cols-2">{media.map((evidence) => <MediaEvidence key={evidence.id} evidence={evidence} />)}</div></Block> : null,
    results: results.length ? <Block title="Verified results and supporting evidence"><div className="grid gap-4 sm:grid-cols-2">{results.map((evidence) => <EvidenceCard key={evidence.id} evidence={evidence} />)}</div></Block> : null,
    status: item.projectStatus ? <Block title="Current status"><Text value={item.projectStatus} /></Block> : null,
    insights: item.engineeringInsights ? <Block title="Engineering insights"><Text value={item.engineeringInsights} /></Block> : null,
  };
}

function CallToAction({ item }: { item: CaseStudy }) { if (caseStudyAcquisitionEnabled(item)) return <section className="rounded-2xl bg-blue-700 p-7 text-white"><h2 className="text-2xl font-bold">Explore this Frontier product</h2><p className="mt-2 text-blue-100">Review the currently configured acquisition, licensing, or customization options.</p><AcquisitionLink slug={(item.source as AppRecord).slug!} className="mt-5 inline-flex rounded-lg bg-white px-5 py-3 font-bold text-blue-800">View commercial options</AcquisitionLink></section>; if (item.ownershipType === 'client_project') return <section className="rounded-2xl bg-slate-900 p-7 text-white"><h2 className="text-2xl font-bold">Request a similar build</h2><p className="mt-2 text-slate-200">Tell Frontier DevConsults about the outcomes and engineering requirements you need.</p><Link href={`/request-build?project=${encodeURIComponent(sourceName(item))}`} className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-bold text-white">Request a build</Link></section>; return null; }
function SourceArtwork({ item }: { item: CaseStudy }) { return item.sourceType === 'app' ? <AppArtwork app={item.source as AppRecord} variant="detail" className="h-24 w-24 shrink-0 rounded-2xl" /> : <ProjectArtwork title={(item.source as Project).title} src={(item.source as Project).logoUrl} className="h-24 w-24 shrink-0" />; }
function MediaEvidence({ evidence }: { evidence: CaseStudyEvidence }) { return <figure className="overflow-hidden rounded-xl border border-gray-200 bg-white">{evidence.type === 'project_video' ? <video src={evidence.sourceUrl!} controls playsInline className="aspect-video w-full bg-black object-contain" /> : <Image src={evidence.sourceUrl!} alt={evidence.title} width={1200} height={800} className="h-auto w-full object-contain" />}<figcaption className="p-4"><strong>{evidence.title}</strong>{evidence.description && <p className="mt-1 text-sm text-gray-600">{evidence.description}</p>}</figcaption></figure>; }
function EvidenceCard({ evidence }: { evidence: CaseStudyEvidence }) { return <div className="rounded-xl border border-gray-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-blue-700">{evidence.type.replaceAll('_', ' ')}</p>{evidence.type === 'testimonial' && evidence.testimonialText ? <blockquote className="mt-3 text-lg leading-7 text-gray-800">“{evidence.testimonialText}”</blockquote> : <><h3 className="mt-2 font-bold text-gray-950">{evidence.title}</h3>{evidence.description && <Text value={evidence.description} />}</>}{evidence.type === 'testimonial' && <p className="mt-3 text-sm font-semibold text-gray-600">{[evidence.clientName, evidence.clientRole, evidence.clientCompany].filter(Boolean).join(' · ')}</p>}{evidence.externalUrl && <a href={evidence.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex font-semibold text-blue-700">Open approved source →</a>}</div>; }
function Block({ title, children }: { title: string; children: React.ReactNode }) { return <section><h2 className="text-2xl font-bold text-gray-950 sm:text-3xl">{title}</h2><div className="mt-5 leading-7 text-gray-700">{children}</div></section>; }
function List({ title, items }: { title: string; items: string[] }) { return <Block title={title}><ul className="grid gap-3 sm:grid-cols-2">{items.map((item) => <li key={item} className="rounded-lg border border-gray-200 bg-white p-4">{item}</li>)}</ul></Block>; }
function Text({ value }: { value: string }) { return <p className="mt-2 whitespace-pre-line">{value}</p>; }
function Definition({ label, value, card = false }: { label: string; value?: string; card?: boolean }) { if (!value) return null; return <div className={card ? 'rounded-xl border border-gray-200 bg-white p-5' : 'mt-4'}><h3 className="font-bold capitalize text-gray-950">{label}</h3><Text value={value} /></div>; }
function sourceName(item: CaseStudy) { return item.sourceType === 'app' ? (item.source as AppRecord).name : (item.source as Project).title; }
function sourceLifecycle(item: CaseStudy) { return item.sourceType === 'app' ? (item.source as AppRecord).lifecycle.replaceAll('_', ' ') : (item.source as Project).status; }
function approvedImage(item: CaseStudy) { return item.evidence.find((evidence) => ['screenshot', 'desktop_screenshot', 'architecture_diagram'].includes(evidence.type) && evidence.sourceUrl)?.sourceUrl || (item.sourceType === 'app' ? (item.source as AppRecord).ogImageUrl || (item.source as AppRecord).iconUrl : (item.source as Project).logoUrl) || undefined; }
