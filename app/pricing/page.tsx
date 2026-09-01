import type { Metadata } from 'next';
import CurrencyPricing from '@/components/CurrencyPricing';
import { getPricingSettings } from '@/lib/pricing-store';
import { publicPricingNote } from '@/lib/pricing';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'International Service Pricing', description: 'USD-first planning estimates with optional dated Ghana cedi conversion for Frontier DevConsults software and engineering services.', alternates: { canonical: '/pricing' }, openGraph: { title: 'International Service Pricing | Frontier DevConsults', description: 'USD planning estimates for software and engineering engagements, with an accessible dated GHS conversion.', url: '/pricing', images: ['/og-image.png'] }, twitter: { card: 'summary_large_image', title: 'International Service Pricing | Frontier DevConsults', description: 'USD-first software and engineering planning estimates.', images: ['/og-image.png'] } };

export default async function PricingPage() {
  const pricing = await getPricingSettings();
  return <main id="main-content" className="min-h-screen bg-gray-50"><section className="bg-gradient-to-br from-slate-950 to-blue-900 py-20 text-white"><div className="mx-auto max-w-5xl px-4 text-center sm:px-6"><p className="font-bold uppercase tracking-[0.18em] text-blue-300">International pricing</p><h1 className="mt-4 text-4xl font-bold sm:text-5xl">Clear planning estimates</h1><p className="mx-auto mt-5 max-w-3xl text-xl text-slate-200">Indicative USD prices for international software and engineering engagements, with an optional dated GHS conversion.</p></div></section><section className="py-14"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><CurrencyPricing pricing={pricing} /><div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><p>{publicPricingNote(pricing.note)}</p><p className="mt-2 font-semibold">Final quotations for direct Ghana engagements are issued and settled in Ghana cedis after the project scope is confirmed.</p><p className="mt-2">Projects initiated through Upwork must be contracted and paid through Upwork. Direct website arrangements apply only to direct Frontier DevConsults engagements.</p></div></div></section></main>;
}
