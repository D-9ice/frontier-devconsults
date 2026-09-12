import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import AcquisitionLink from '@/components/AcquisitionLink';
import AppArtwork from '@/components/AppArtwork';
import CommercialEvent from '@/components/CommercialEvent';
import ProductGallery from '@/components/ProductGallery';
import { getPublishedAppBySlug } from '@/lib/apps';
import { SITE_ORIGIN } from '@/lib/site-url';
import { toPublicAppDetail } from '@/lib/public-apps';

type Props = { params: Promise<{ slug: string }> };
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const app = await getPublishedAppBySlug((await params).slug);
  if (!app) return { title: 'Solution not found', robots: { index: false, follow: false } };
  const detail = toPublicAppDetail(app);
  const title = detail.seoTitle || detail.name;
  const description = (detail.seoDescription || detail.summary || detail.description).slice(0, 160);
  const image = detail.ogImageUrl || detail.artworkUrl || '/og-image.png';
  return { title, description, alternates: { canonical: `/app-store/${detail.slug}` }, openGraph: { title: `${title} | Frontier DevConsults`, description, url: `/app-store/${detail.slug}`, images: [{ url: image, alt: `${detail.name} digital product` }] }, twitter: { card: 'summary_large_image', title: `${title} | Frontier DevConsults`, description, images: [image] } };
}

export default async function AppDetailPage({ params }: Props) {
  const app = await getPublishedAppBySlug((await params).slug);
  if (!app) notFound();
  const detail = toPublicAppDetail(app);
  const { cta, name } = detail;
  const schema = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name, description: detail.description, applicationCategory: detail.solutionKindLabel, operatingSystem: detail.artifactPlatform || undefined, url: `${SITE_ORIGIN}/app-store/${detail.slug}`, image: detail.ogImageUrl || detail.artworkUrl || undefined };
  const breadcrumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Digital Products', item: `${SITE_ORIGIN}/app-store` }, { '@type': 'ListItem', position: 2, name, item: `${SITE_ORIGIN}/app-store/${detail.slug}` }] };

  return <main id="main-content" className="min-h-screen bg-gray-50">
    <JsonLd value={schema} /><JsonLd value={breadcrumbs} /><CommercialEvent name="product_view" productSlug={detail.slug || undefined} />
    <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 py-16 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link href="/app-store" className="text-sm font-semibold text-blue-200 hover:text-white">← Digital Products &amp; Acquisition Opportunities</Link>
        <div className="mt-8 grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
          <AppArtwork name={name} src={detail.artworkUrl} size="detail" priority />
          <div><p className="font-semibold text-blue-200">{detail.solutionKindLabel} · {detail.category}</p><h1 className="mt-2 text-4xl font-bold sm:text-5xl">{name}</h1><p className="mt-4 max-w-3xl text-xl leading-8 text-blue-100">{detail.tagline || detail.summary}</p><div className="mt-5 flex flex-wrap gap-2"><Tag>{detail.developmentStatusLabel}</Tag><Tag>{detail.availabilityLabel}</Tag>{detail.commercialLabels.map((label) => <Tag key={label}>{label}</Tag>)}</div>{detail.completionPercentage !== null && <div className="mt-6 max-w-xl"><div className="mb-2 flex justify-between text-sm font-bold"><span>Engineering completion</span><span>{detail.completionPercentage}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${detail.completionPercentage}%` }} /></div></div>}
            <div className="mt-7 flex flex-wrap gap-3">{detail.acquisitionEnabled && detail.slug && <AcquisitionLink slug={detail.slug} className="rounded-lg bg-white px-5 py-3 font-bold text-blue-950 hover:bg-blue-50">Acquire This Application</AcquisitionLink>}{cta && cta.external && <a href={cta.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/60 px-5 py-3 font-bold text-white hover:bg-white/10">{cta.label}<ExternalLink className="h-4 w-4" /></a>}<Link href={`/contact?subject=${encodeURIComponent(`Private demo request — ${name}`)}`} className="rounded-lg border border-white/60 px-5 py-3 font-bold text-white hover:bg-white/10">Request Private Demo</Link></div>
          </div>
        </div>
      </div>
    </section>

    <div className="mx-auto grid max-w-6xl gap-9 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
      <article className="space-y-11">
        <Section title="Product overview"><p className="whitespace-pre-line text-lg leading-8 text-gray-700">{detail.description}</p></Section>
        {detail.screenshotUrls.length > 0 && <ProductGallery name={name} images={detail.screenshotUrls} />}
        {detail.clientProblem && <Section title="The problem"><p>{detail.clientProblem}</p></Section>}
        {detail.solutionSummary && <Section title="The solution"><p>{detail.solutionSummary}</p></Section>}
        {detail.features.length > 0 && <ListSection title="Already implemented" items={detail.features} />}
        {detail.roadmapItems.length > 0 && <ListSection title="Planned roadmap" items={detail.roadmapItems} />}
        {Object.keys(detail.technologyStack).length > 0 ? <Section title="Technology stack"><div className="grid gap-4 sm:grid-cols-2">{Object.entries(detail.technologyStack).map(([group, items]) => <div key={group} className="rounded-xl border border-gray-200 bg-white p-5"><h3 className="font-bold capitalize text-gray-950">{group.replaceAll('_', ' ')}</h3><div className="mt-3 flex flex-wrap gap-2">{items.map((item) => <TechTag key={item}>{item}</TechTag>)}</div></div>)}</div></Section> : detail.technologies.length > 0 && <ListSection title="Technology stack" items={detail.technologies} tags />}
        {detail.responsibilities.length > 0 && <ListSection title="My role and responsibilities" items={detail.responsibilities} />}
        {detail.challenges.length > 0 && <ListSection title="Engineering challenges" items={detail.challenges} />}
        {detail.outcomes.length > 0 && <Section title="Verifiable outcomes"><dl className="grid gap-4 sm:grid-cols-2">{detail.outcomes.map((outcome) => <div key={`${outcome.label}-${outcome.value}`} className="rounded-xl border border-gray-200 bg-white p-5"><dt className="font-semibold text-gray-700">{outcome.label}</dt><dd className="mt-1 text-xl font-bold text-gray-950">{outcome.value}</dd>{outcome.evidenceNote && <dd className="mt-2 text-sm text-gray-600">{outcome.evidenceNote}</dd>}</div>)}</dl></Section>}
        {detail.confidentialityNote && <Section title="Confidentiality"><p>{detail.confidentialityNote}</p></Section>}
      </article>

      <aside className="h-fit space-y-6 lg:sticky lg:top-24">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-gray-950">Commercial opportunity</h2><p className="mt-2 text-sm font-semibold text-gray-700">Commercial terms by enquiry</p>{detail.commercialLabels.length > 0 ? <ul className="mt-4 space-y-2 text-sm text-gray-700">{detail.commercialLabels.map((label) => <li key={label} className="flex gap-2"><span className="text-emerald-600">✓</span>{label}</li>)}</ul> : <p className="mt-3 text-sm text-gray-600">Owner-approved options are confirmed during review.</p>}{detail.customizationAvailable && <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-900">Customization is available by agreed scope.</p>}{detail.deploymentOptions.length > 0 && <div className="mt-5"><h3 className="text-sm font-bold text-gray-950">Deployment options</h3><p className="mt-2 text-sm leading-6 text-gray-600">{detail.deploymentOptions.join(' · ')}</p></div>}{detail.supportSummary && <div className="mt-5"><h3 className="text-sm font-bold text-gray-950">Support</h3><p className="mt-2 text-sm leading-6 text-gray-600">{detail.supportSummary}</p></div>}{detail.acquisitionEnabled && detail.slug && <AcquisitionLink slug={detail.slug} className="mt-6 block rounded-lg bg-blue-600 px-4 py-3 text-center font-bold text-white hover:bg-blue-700">Start Acquisition Request</AcquisitionLink>}<Link href={`/contact?subject=${encodeURIComponent(`Acquisition details — ${name}`)}`} className="mt-3 block rounded-lg border border-blue-600 px-4 py-3 text-center font-bold text-blue-700 hover:bg-blue-50">Request Acquisition Details</Link></div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-gray-950">Release information</h2><dl className="mt-4 space-y-3 text-sm"><Row label="Status" value={detail.developmentStatusLabel} />{detail.artifactVersion && <Row label="Version" value={detail.artifactVersion} />}{detail.artifactBuild && <Row label="Build" value={String(detail.artifactBuild)} />}{detail.artifactPlatform && <Row label="Platform" value={detail.artifactPlatform} />}{detail.artifactByteSize && <Row label="File size" value={formatBytes(detail.artifactByteSize)} />}{detail.artifactReleaseDate && <Row label="Released" value={detail.artifactReleaseDate} />}{detail.artifactChecksum && <Row label="SHA-256" value={detail.artifactChecksum.replace(/^sha256:/i, '')} />}</dl>{detail.showArtifactVerificationNotice && <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm font-semibold leading-5 text-amber-900">Download temporarily unavailable while release metadata is being verified.</p>}</div>
        <div className="rounded-2xl bg-slate-900 p-6 text-white"><ShieldCheck className="h-7 w-7 text-blue-300" /><h2 className="mt-3 text-lg font-bold">Need a different solution?</h2><p className="mt-2 text-sm leading-6 text-slate-300">Frontier DevConsults can engineer a custom product around your exact requirements.</p><Link href={`/request-build?app=${encodeURIComponent(name)}`} className="mt-5 block rounded-lg bg-white px-4 py-3 text-center font-bold text-slate-950">Request a Custom Build</Link></div>
        <p className="px-2 text-xs leading-5 text-gray-500">All availability, completion, licensing, acquisition, support, transfer and customization terms are subject to due diligence and an owner-approved written agreement. No transaction or transfer occurs on this page.</p>
      </aside>
    </div>
  </main>;
}

function JsonLd({ value }: { value: object }) { return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replaceAll('<', '\\u003c') }} />; }
function formatBytes(value: number) { const units = ['B', 'KB', 'MB', 'GB']; let amount = value; let unit = 0; while (amount >= 1024 && unit < units.length - 1) { amount /= 1024; unit += 1; } return `${amount.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section><h2 className="mb-4 text-2xl font-bold text-gray-950">{title}</h2><div className="leading-7 text-gray-700">{children}</div></section>; }
function ListSection({ title, items, tags = false }: { title: string; items: string[]; tags?: boolean }) { return <Section title={title}>{tags ? <div className="flex flex-wrap gap-2">{items.map((item) => <TechTag key={item}>{item}</TechTag>)}</div> : <ul className="space-y-3">{items.map((item) => <li key={item} className="flex gap-3"><span className="font-bold text-blue-600">✓</span><span>{item}</span></li>)}</ul>}</Section>; }
function TechTag({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-800">{children}</span>; }
function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold text-white">{children}</span>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-3"><dt className="shrink-0 text-gray-500">{label}</dt><dd className="min-w-0 break-all text-right font-semibold text-gray-950">{value}</dd></div>; }
