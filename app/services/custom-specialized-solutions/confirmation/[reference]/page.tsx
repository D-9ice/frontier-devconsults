import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { specializedLabels } from '@/lib/specialized-options';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

export const metadata: Metadata = { title: 'Specialized Engineering Request Received', robots: { index: false, follow: false } };

export default async function SpecializedConfirmationPage({ params }: { params: Promise<{ reference: string }> }) {
  const reference = (await params).reference;
  if (!/^FDC-SPEC-\d{4}-[A-F0-9]{24}$/.test(reference) || !isSupabaseServerConfigured() || !supabaseServer) notFound();
  const { data, error } = await supabaseServer.from('specialized_engineering_requests').select('reference_number, full_name, project_types, created_at').eq('reference_number', reference).maybeSingle();
  if (error || !data) notFound();
  const projectTypes = (data.project_types as string[]).map((type) => specializedLabels.projectType[type as keyof typeof specializedLabels.projectType] || type);

  return (
    <main className="min-h-screen bg-slate-50 py-20">
      <section className="mx-auto max-w-3xl px-5 sm:px-6">
        <div className="rounded-3xl border border-emerald-200 bg-white p-8 shadow-sm sm:p-12">
          <CheckCircle2 className="h-14 w-14 text-emerald-600" />
          <h1 className="mt-6 text-3xl font-black text-slate-950 sm:text-4xl">Specialized Engineering Request Received</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">Thank you, {data.full_name}. Frontier DevConsults will review the technical requirements and contact you using the details you provided.</p>
          <dl className="mt-8 grid gap-5 rounded-2xl bg-slate-100 p-6 sm:grid-cols-2">
            <div><dt className="text-sm font-bold text-slate-500">Reference</dt><dd className="mt-1 break-all font-mono font-bold text-slate-950">{data.reference_number}</dd></div>
            <div><dt className="text-sm font-bold text-slate-500">Submitted</dt><dd className="mt-1 font-semibold text-slate-950">{new Intl.DateTimeFormat('en-GH', { dateStyle: 'long', timeZone: 'Africa/Accra' }).format(new Date(data.created_at))}</dd></div>
            <div className="sm:col-span-2"><dt className="text-sm font-bold text-slate-500">Project category</dt><dd className="mt-1 font-semibold text-slate-950">{projectTypes.join(', ')}</dd></div>
          </dl>
          <div className="mt-8"><h2 className="text-xl font-bold">What happens next</h2><ol className="mt-3 list-decimal space-y-2 pl-5 leading-7 text-slate-600"><li>We review the system, technical constraints, and requested outcome.</li><li>We contact you if clarification or an initial consultation is needed.</li><li>Any feasible engagement proceeds only through an agreed written scope, quotation, and delivery plan.</li></ol></div>
          <p className="mt-6 text-sm leading-6 text-slate-500">Please keep your reference. Secure exchange of technical files can be arranged after the initial review.</p>
          <div className="mt-8 flex flex-wrap gap-4"><Link href="/services/custom-specialized-solutions" className="rounded-lg bg-blue-700 px-5 py-3 font-bold text-white">Return to the service</Link><Link href="/" className="rounded-lg border border-slate-300 px-5 py-3 font-bold text-slate-800">Home</Link></div>
        </div>
      </section>
    </main>
  );
}
