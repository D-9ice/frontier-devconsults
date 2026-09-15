import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'G-Tube Commercial Licensing Framework | Frontier DevConsults',
  description: 'Commercial licensing, white-label, acquisition, customization and deployment framework for the G-Tube platform by Frontier DevConsults.',
  alternates: { canonical: '/licenses/g-tube' },
};

export default function GTubeLicensePage() {
  const lastUpdated = 'September 15, 2026';

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-slate-950 to-blue-950 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Frontier DevConsults</p>
          <h1 className="mb-4 text-4xl font-bold">G-Tube Commercial Licensing Framework</h1>
          <p className="max-w-3xl text-gray-300">Owner-approved commercial pathways for G-Tube, an in-house Ghana-first video-sharing and creator platform currently in active development.</p>
          <p className="mt-4 text-sm text-gray-400">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-blue max-w-none rounded-xl bg-white p-8 shadow-sm">
          <Section title="1. Status and Purpose">
            <p>G-Tube is an in-house Frontier DevConsults product currently in active development. This page describes commercial options that Frontier may offer for the platform. It is not itself a licence grant, sale, transfer of ownership, or binding offer.</p>
            <p>Any transaction requires a separate written agreement signed by the relevant parties. That agreement will control the final scope, rights, price, payment terms, support, warranties, exclusions, handover and third-party services.</p>
          </Section>

          <Section title="2. Owner-Approved Commercial Options">
            <ul>
              <li><strong>Hosted licence:</strong> Frontier hosts and operates an approved deployment while the client receives agreed usage rights.</li>
              <li><strong>White-label deployment:</strong> an approved deployment may be customized to the client&apos;s branding, configuration and market requirements.</li>
              <li><strong>Exclusive licence:</strong> exclusivity may be negotiated for a defined territory, market, use case or period.</li>
              <li><strong>Exclusive or full acquisition:</strong> a negotiated transaction may transfer specified assets or ownership rights, subject to technical and commercial due diligence.</li>
              <li><strong>Strategic partnership:</strong> Frontier may consider joint deployment, commercialization or market-development arrangements.</li>
              <li><strong>Custom completion and deployment:</strong> unfinished, optional or client-specific features may be completed and integrated to an agreed specification.</li>
            </ul>
          </Section>

          <Section title="3. Customization">
            <p>G-Tube is configurable to approved client requirements. Customization may include branding, regional configuration, creator workflows, moderation, subscriptions, billing, payment integrations, video infrastructure, analytics, administrative workflows and deployment architecture.</p>
            <p>Requested changes are assessed for technical feasibility, security, third-party dependencies, compliance implications, delivery time and commercial impact before work is approved.</p>
          </Section>

          <Section title="4. Intellectual Property and Source Code">
            <p>Until a signed agreement expressly states otherwise, Frontier DevConsults retains ownership of G-Tube source code, architecture, product design, reusable components, documentation, know-how, branding and related intellectual property.</p>
            <p>A licence does not transfer ownership. Any source-code handover, exclusivity, assignment or acquisition rights must be specifically identified in the signed agreement and become effective only when the agreed conditions, including payment conditions, are satisfied.</p>
          </Section>

          <Section title="5. Third-Party Services and Licences">
            <p>G-Tube may integrate third-party infrastructure and services such as Vercel, PostgreSQL/Supabase, Cloudflare Stream, Paystack, OpenAI, open-source software and other providers. Those services remain subject to their own pricing, availability, terms and licences.</p>
            <p>Unless expressly included in the signed agreement, third-party account fees, usage charges, provider approvals and ongoing subscriptions are separate from the G-Tube licence or acquisition consideration.</p>
          </Section>

          <Section title="6. Development and Production Readiness">
            <p>Published demonstrations may include staging data and integration-ready components. Features or providers that are not yet connected to production infrastructure must not be treated as live operational services until they are configured, tested and accepted for the relevant deployment.</p>
          </Section>

          <Section title="7. Commercial Due Diligence">
            <p>Before any licence, acquisition, white-label deployment or partnership is finalized, the parties should confirm the exact product version, included modules, customization scope, hosting model, source-code rights, data responsibilities, security requirements, support period, maintenance obligations, third-party accounts and acceptance criteria.</p>
          </Section>

          <Section title="8. Relationship to Frontier Terms">
            <p>This framework supplements the Frontier DevConsults <Link href="/terms">Terms of Service</Link>. If a signed G-Tube licence, acquisition agreement, statement of work or other engagement-specific contract conflicts with this page or the general website Terms, the signed engagement-specific agreement controls for that transaction.</p>
          </Section>

          <Section title="9. Licensing and Acquisition Enquiries">
            <p>Commercial terms are provided by enquiry because scope, deployment model, customization, exclusivity and ownership rights can materially change the transaction.</p>
            <div className="rounded-lg bg-blue-50 p-6">
              <p className="mb-2 text-gray-800"><strong>Frontier DevConsults</strong></p>
              <p className="mb-1 text-gray-600">Email: info@frontier-devconsults.com</p>
              <p className="mb-1 text-gray-600">Website: www.frontier-devconsults.com</p>
              <p className="text-gray-600">Location: Greater Accra, Ghana</p>
            </div>
          </Section>

          <div className="mt-12 border-t border-gray-200 pt-8">
            <Link href="/app-store/g-tube" className="font-semibold text-blue-600 hover:text-blue-700">← Return to G-Tube</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 text-gray-600 [&_a]:font-semibold [&_a]:text-blue-700 [&_a]:underline [&_li]:mb-2 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}
