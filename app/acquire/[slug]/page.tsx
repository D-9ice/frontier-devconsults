import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import AcquisitionForm from '@/components/AcquisitionForm';
import AppArtwork from '@/components/AppArtwork';
import { getPublishedAppBySlug } from '@/lib/apps';
import { isAcquisitionEnabled } from '@/lib/application-presentation';
import { toPublicAppDetail } from '@/lib/public-apps';

type Props = { params: Promise<{ slug: string }> };
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const app = await getPublishedAppBySlug((await params).slug);
  if (!app || !isAcquisitionEnabled(app)) return { title: 'Acquisition opportunity unavailable', robots: { index: false, follow: false } };
  return {
    title: `Acquire ${app.name}`,
    description: `Submit a confidential application acquisition request for ${app.name} to Frontier DevConsults.`,
    robots: { index: false, follow: true },
  };
}

export default async function AcquireApplicationPage({ params }: Props) {
  const app = await getPublishedAppBySlug((await params).slug);
  if (!app || !isAcquisitionEnabled(app)) notFound();
  const detail = toPublicAppDetail(app);

  return <main id="main-content" className="min-h-screen bg-slate-50">
    <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 py-14 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link href={`/app-store/${detail.slug}`} className="text-sm font-semibold text-blue-200 hover:text-white">← Return to product details</Link>
        <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-center">
          <AppArtwork name={detail.name} src={detail.artworkUrl} size="detail" priority />
          <div>
            <p className="font-bold uppercase tracking-[0.16em] text-blue-200">Application acquisition request</p>
            <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Acquire {detail.name}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-blue-100">{detail.tagline || detail.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2"><Tag>{detail.developmentStatusLabel}</Tag>{detail.completionPercentage !== null && <Tag>{detail.completionPercentage}% engineering completion</Tag>}{detail.commercialLabels.map((label) => <Tag key={label}>{label}</Tag>)}</div>
          </div>
        </div>
      </div>
    </section>

    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[19rem_1fr] lg:px-8">
      <aside className="h-fit space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div><h2 className="text-xl font-bold text-gray-950">What happens next</h2><ol className="mt-4 space-y-4 text-sm leading-6 text-gray-700">{['Submit your requirements', 'Frontier reviews technical and commercial fit', 'A confidential discussion is arranged', 'Scope, due diligence and written terms follow'].map((item, index) => <li key={item} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800">{index + 1}</span><span>{item}</span></li>)}</ol></div>
        <div className="border-t border-gray-200 pt-5"><p className="flex gap-2 font-semibold text-gray-900"><ShieldCheck className="h-5 w-5 text-emerald-600" />Secure commercial inquiry</p><p className="mt-2 text-sm leading-6 text-gray-600">Your information is used to evaluate and respond to this request.</p></div>
        <div className="border-t border-gray-200 pt-5"><p className="flex gap-2 font-semibold text-gray-900"><CheckCircle2 className="h-5 w-5 text-blue-600" />No automatic transaction</p><p className="mt-2 text-sm leading-6 text-gray-600">Submission does not transfer ownership, source code, intellectual property, licences, domains, or third-party accounts.</p></div>
      </aside>
      <AcquisitionForm app={app} />
    </section>
  </main>;
}

function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold">{children}</span>; }
