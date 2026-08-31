import type { Metadata } from 'next';
import AppCatalogue, { AppCard } from '@/components/AppCatalogue';
import { listApps } from '@/lib/apps';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Apps & Solutions', description: 'Explore published applications, web platforms, AI systems and engineering solutions from Frontier DevConsults.', alternates: { canonical: '/app-store' } };

export default async function AppStorePage() {
  let apps: Awaited<ReturnType<typeof listApps>> = [];
  try { apps = await listApps(false); } catch (error) { console.error('Public Apps & Solutions fetch failed:', error); }
  const featured = apps.filter((app) => app.featured).slice(0, 6);
  return <main className="min-h-screen bg-gray-50"><section className="bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-900 py-20 text-white"><div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8"><img src="/logos/frontier-emblem.png" alt="" className="mx-auto mb-5 h-20 w-20 object-contain" /><h1 className="text-4xl font-bold sm:text-5xl">Apps &amp; Solutions</h1><p className="mx-auto mt-5 max-w-3xl text-lg text-blue-100 sm:text-xl">Applications, web platforms, AI systems and engineering solutions—presented according to their current lifecycle and availability.</p></div></section><section className="py-14"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{apps.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center"><h2 className="text-2xl font-bold text-gray-900">No published solutions yet</h2><p className="mx-auto mt-3 max-w-xl text-gray-600">Owner-approved applications and solutions will appear here after publication through the existing admin dashboard.</p></div> : <>{featured.length > 0 && <section className="mb-12" aria-labelledby="featured-solutions"><div className="mb-6"><h2 id="featured-solutions" className="text-3xl font-bold text-gray-900">Featured</h2><p className="mt-2 text-gray-600">A short selection of highlighted work.</p></div><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{featured.map((app) => <AppCard key={app.id} app={app} />)}</div></section>}<div className="mb-8"><h2 className="text-3xl font-bold text-gray-900">All Apps &amp; Solutions</h2><p className="mt-2 text-gray-600">Search and compare every published record.</p></div><AppCatalogue apps={apps} /></>}</div></section></main>;
}
