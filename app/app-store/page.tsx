import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import AppCatalogue, { AppCard } from '@/components/AppCatalogue';
import { listApps } from '@/lib/apps';
import { toPublicAppCard } from '@/lib/public-apps';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Digital Products & Acquisition Opportunities',
  description: 'Explore digital products available for licensing, customization, acquisition or partnership, alongside published Frontier DevConsults solutions.',
  alternates: { canonical: '/app-store' },
  openGraph: { title: 'Digital Products & Acquisition Opportunities | Frontier DevConsults', description: 'Production software, AI products and acquisition opportunities with transparent development and availability information.', url: '/app-store', images: ['/og-image.png'] },
  twitter: { card: 'summary_large_image', title: 'Digital Products & Acquisition Opportunities | Frontier DevConsults', description: 'Explore digital products, licensing and acquisition opportunities.', images: ['/og-image.png'] },
};

export default async function AppStorePage() {
  let apps: Awaited<ReturnType<typeof listApps>> = [];
  try { apps = await listApps(false); } catch (error) { console.error('Public digital products fetch failed:', error); }
  const publicApps = apps.map(toPublicAppCard);
  const featured = apps.filter((app) => app.featured).slice(0, 6).map(toPublicAppCard);
  return <main className="min-h-screen bg-gray-50">
    <section className="bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-900 py-20 text-white"><div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8"><Image src="/logos/frontier-emblem.webp" alt="" width={80} height={80} sizes="80px" priority className="mx-auto mb-5 h-20 w-20 object-contain" /><p className="font-bold uppercase tracking-[0.18em] text-blue-200">Build, license, customize or acquire</p><h1 className="mt-3 text-4xl font-bold sm:text-5xl">Digital Products &amp; Acquisition Opportunities</h1><p className="mx-auto mt-5 max-w-3xl text-lg text-blue-100 sm:text-xl">Explore engineered applications and platforms with transparent development status, implemented capabilities, roadmap context, and owner-approved commercial options.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><a href="#catalogue" className="rounded-lg bg-white px-5 py-3 font-bold text-blue-950">Explore Products</a><Link href="/request-build" className="rounded-lg border border-white/60 px-5 py-3 font-bold text-white">Request a Custom Build</Link></div></div></section>
    <section id="catalogue" className="scroll-mt-24 py-14"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{publicApps.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center"><h2 className="text-2xl font-bold text-gray-900">No published solutions yet</h2><p className="mx-auto mt-3 max-w-xl text-gray-600">Owner-approved digital products and solutions will appear here after publication.</p></div> : <>{featured.length > 0 && <section className="mb-12" aria-labelledby="featured-solutions"><div className="mb-6"><h2 id="featured-solutions" className="text-3xl font-bold text-gray-900">Featured Digital Products</h2><p className="mt-2 text-gray-600">Selected products open for exploration and approved commercial conversations.</p></div><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{featured.map((app) => <AppCard key={app.id} app={app} />)}</div></section>}<div className="mb-8"><h2 className="text-3xl font-bold text-gray-900">All Digital Products &amp; Solutions</h2><p className="mt-2 text-gray-600">Search by technology, development stage, availability, or commercial option.</p></div><AppCatalogue apps={publicApps} /></>}</div></section>
  </main>;
}
