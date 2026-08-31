import type { Metadata } from 'next';
import CurrencyPricing from '@/components/CurrencyPricing';
import { getPricingSettings } from '@/lib/pricing-store';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Service Pricing', description: 'Ghana cedi planning estimates for Frontier DevConsults software and engineering services.', alternates: { canonical: '/pricing' } };

export default async function PricingPage() {
  const pricing = await getPricingSettings(); const effective = new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(pricing.exchangeRateEffectiveAt));
  return <main className="min-h-screen bg-gray-50"><section className="bg-gradient-to-br from-slate-950 to-blue-900 py-20 text-white"><div className="mx-auto max-w-5xl px-4 text-center sm:px-6"><p className="font-bold uppercase tracking-[0.18em] text-blue-300">Ghana cedi pricing</p><h1 className="mt-4 text-4xl font-bold sm:text-5xl">Clear planning estimates</h1><p className="mx-auto mt-5 max-w-3xl text-xl text-slate-200">Indicative prices for software and engineering engagements, displayed in Ghana cedis.</p></div></section><section className="py-14"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><CurrencyPricing pricing={pricing} /><div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><p>{pricing.note}</p><p className="mt-2">Planning estimates were last recalculated using {pricing.exchangeRateSourceLabel}, effective {effective}.</p><p className="mt-2 font-semibold">Final quotations for direct engagements are issued in Ghana cedis after the project scope is confirmed.</p><p className="mt-2">Projects initiated through Upwork must be contracted and paid through Upwork. Direct website arrangements apply only to direct Frontier DevConsults engagements.</p></div></div></section></main>;
}
