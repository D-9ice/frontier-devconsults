import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

type Props = { params: Promise<{ reference: string }> };
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Acquisition request received', robots: { index: false, follow: false } };

export default async function AcquisitionConfirmationPage({ params }: Props) {
  const reference = decodeURIComponent((await params).reference).toUpperCase();
  if (!/^FDC-ACQ-\d{4}-[A-F0-9]{24}$/.test(reference) || !isSupabaseServerConfigured() || !supabaseServer) notFound();
  const { data, error } = await supabaseServer.from('application_acquisition_requests').select('reference_number,product_name,buyer_full_name,buyer_company,created_at').eq('reference_number', reference).maybeSingle();
  if (error || !data) notFound();
  return <main id="main-content" className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6">
    <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-7 shadow-xl sm:p-10">
      <CheckCircle2 className="h-16 w-16 text-emerald-600" aria-hidden="true" />
      <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Request received</p>
      <h1 className="mt-2 text-3xl font-bold text-gray-950 sm:text-4xl">Thank you, {data.buyer_full_name}.</h1>
      <p className="mt-4 text-lg leading-8 text-gray-700">Frontier DevConsults has received your acquisition request for <strong>{data.product_name}</strong> on behalf of {data.buyer_company}.</p>
      <dl className="mt-7 rounded-2xl bg-slate-50 p-5"><dt className="text-sm font-semibold text-gray-600">Reference number</dt><dd className="mt-1 break-all text-xl font-bold text-gray-950">{data.reference_number}</dd><dt className="mt-4 text-sm font-semibold text-gray-600">Submitted</dt><dd className="mt-1 font-medium text-gray-900">{new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Africa/Accra' }).format(new Date(data.created_at))}</dd></dl>
      <div className="mt-7 rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950"><strong>Next step:</strong> we will review the technical and commercial requirements and contact you using the details supplied. Keep the reference number for future correspondence.</div>
      <p className="mt-5 text-sm leading-6 text-gray-600">This confirmation records an inquiry only. It is not a purchase agreement, transfer of ownership, assignment of intellectual property, or licence grant.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/app-store" className="rounded-lg bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700">Explore Digital Products</Link><Link href="/contact" className="rounded-lg border border-gray-300 px-5 py-3 font-bold text-gray-800 hover:bg-gray-50">Contact Frontier</Link></div>
    </div>
  </main>;
}
