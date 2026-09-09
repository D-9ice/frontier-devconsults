import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms governing use of the Frontier DevConsults website, inquiries, products, and services.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  const lastUpdated = 'September 8, 2026';

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold">Terms of Service</h1>
          <p className="text-gray-300">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-blue max-w-none rounded-lg bg-white p-8 shadow-sm">
          <TermsSection title="1. Agreement and Contract Priority">
            <p>These Terms govern access to frontier-devconsults.com and use of its public features. By using the website or submitting a request, you agree to these Terms and our <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not use the website.</p>
            <p>A signed proposal, statement of work, licence, acquisition agreement, support agreement, or contract formed through a third-party marketplace may contain engagement-specific terms. If those terms conflict with these website Terms, the engagement-specific agreement controls for that engagement.</p>
            <p>For work initiated through Upwork or another marketplace, communications, contracts, payments, disputes, and other activity must follow that platform's applicable rules while those rules apply.</p>
          </TermsSection>

          <TermsSection title="2. Website Use">
            <p>You may use this website to learn about our services and products, view published work, request a quotation, submit a specialized-engineering or acquisition inquiry, and use other features made available to you.</p>
            <p>You must not misuse the website, attempt unauthorised access, interfere with its operation, submit unlawful or harmful content, impersonate another person, probe security controls, scrape protected areas, or use automated means in a way that imposes an unreasonable load.</p>
          </TermsSection>

          <TermsSection title="3. Services">
            <p>Frontier DevConsults provides services that may include:</p>
            <ul>
              <li>Mobile, web, full-stack, e-commerce, and progressive-web-application development.</li>
              <li>AI integration, machine-learning implementation, automation, and API integration.</li>
              <li>Custom software, maintenance, deployment, and technical support.</li>
              <li>Specialized solutions spanning electronics, electrical systems, embedded control, monitoring, connectivity, diagnostics, retrofit, and related system integration.</li>
              <li>Owner-approved application licensing, white-label deployment, acquisition, completion, and partnership opportunities.</li>
            </ul>
            <p>Website descriptions are general information, not a promise that every service, feature, product, timeline, or commercial option is available for every request.</p>
          </TermsSection>

          <TermsSection title="4. Inquiries, Quotations, and Project Engagements">
            <h3>4.1 Non-binding inquiries</h3>
            <p>A form submission, reference number, consultation, estimate, demonstration, or discussion begins an evaluation process only. It does not by itself require either party to proceed.</p>
            <h3>4.2 Scope and acceptance</h3>
            <p>Work begins only after the parties agree in writing on the applicable scope, deliverables, responsibilities, assumptions, acceptance criteria, schedule, price, and payment terms. Scope changes may affect price and timing and should be confirmed in writing.</p>
            <h3>4.3 Estimates and dependencies</h3>
            <p>Planning estimates and delivery dates are provided in good faith. Client feedback, delayed materials, scope changes, technical discoveries, third-party approvals, provider outages, and other dependencies may affect delivery.</p>
          </TermsSection>

          <TermsSection title="5. Pricing, Currency, Payments, and Taxes">
            <p>Prices shown on the website are indicative planning estimates. United States dollar amounts are authoritative unless a written agreement states otherwise. Ghana-cedi displays are approximate conversions based on a dated reference rate and may differ from the amount charged or settled.</p>
            <p>The payment schedule, deposit, milestones, due dates, refund treatment, transaction charges, and any lawful late-payment consequences will be stated in the applicable written agreement or platform contract. Website payment labels identify methods we may accept; they do not guarantee availability for every transaction.</p>
            <p>Unless a written agreement states otherwise, quoted amounts exclude taxes, duties, withholding, platform fees, exchange costs, and third-party charges for which the client is legally responsible. Payment-card and provider transactions are also subject to the provider's terms.</p>
          </TermsSection>

          <TermsSection title="6. Digital Products, Downloads, and Licences">
            <p>Access to a downloadable application, hosted product, demonstration, or digital asset does not transfer ownership of the underlying intellectual property. Use is subject to the licence displayed with the product or supplied during acquisition.</p>
            <p>You may not redistribute, resell, reverse engineer, remove notices from, or commercially exploit a product except where the applicable licence or law expressly permits it. Version, compatibility, checksum, support, and release information displayed for a download apply only to the identified artifact.</p>
            <p>Paid digital-product cancellation, refund, subscription, and renewal terms will be disclosed before purchase through the applicable checkout, licence, marketplace, or written agreement.</p>
          </TermsSection>

          <TermsSection title="7. Application Acquisition and Licensing Requests">
            <p>An acquisition, licensing, white-label, deployment, completion, support, or partnership request is non-binding. A listing, development percentage, form submission, reference number, demonstration, or discussion does not transfer ownership, grant a licence, reserve exclusivity, or commit either party.</p>
            <p>Any approved transaction requires technical and commercial due diligence and a separate written agreement defining consideration, completion work, support, warranties, exclusions, and the treatment of source code, branding, domains, provider accounts, data, third-party assets, and licences.</p>
          </TermsSection>

          <TermsSection title="8. Specialized Engineering Assessments">
            <p>A specialized-project submission, preliminary concept, architecture, estimate, consultation, or feasibility discussion is not a certification, statutory approval, final safety determination, or commitment to deliver. Project-specific feasibility, operating conditions, hazards, acceptance criteria, responsibilities, and commercial terms must be assessed and confirmed in writing.</p>
            <p>Licensed professionals, accredited laboratories, authorities, certified installers, permits, and regulatory approvals remain separately required wherever applicable to electrical work, machinery, radio equipment, regulated products, hazardous energy, public safety, or other controlled activities.</p>
          </TermsSection>

          <TermsSection title="9. Frontier Assistant and AI-Generated Information">
            <p>The Frontier Assistant provides general guidance based on approved public website information. Responses may be incomplete or inaccurate and are not professional, legal, financial, safety, or engineering advice. Do not submit passwords, payment credentials, health records, confidential project information, or other sensitive data. Important requirements and decisions must be confirmed with a human and documented in writing.</p>
          </TermsSection>

          <TermsSection title="10. Intellectual Property">
            <h3>10.1 Client deliverables</h3>
            <p>Ownership or licence rights in custom deliverables are determined by the applicable written agreement. Where the agreement provides for client ownership, transfer occurs only after the stated conditions, including full payment, have been satisfied.</p>
            <h3>10.2 Pre-existing and reusable materials</h3>
            <p>Frontier DevConsults retains ownership of pre-existing code, know-how, frameworks, templates, libraries, tools, and reusable components unless expressly transferred in writing. The client receives only the rights stated in the applicable agreement.</p>
            <h3>10.3 Third-party materials</h3>
            <p>Open-source software, APIs, platforms, fonts, media, and other third-party materials remain subject to their own terms and licences.</p>
          </TermsSection>

          <TermsSection title="11. Client Responsibilities">
            <ul>
              <li>Provide accurate requirements, lawful content, timely decisions, feedback, approvals, access, and materials.</li>
              <li>Secure rights to any content, data, credentials, systems, or assets supplied for the work.</li>
              <li>Maintain required third-party accounts, licences, subscriptions, approvals, backups, and operational safeguards.</li>
              <li>Review deliverables and report issues within agreed acceptance or warranty periods.</li>
              <li>Pay invoices and platform charges according to the applicable agreement.</li>
            </ul>
          </TermsSection>

          <TermsSection title="12. Confidentiality and Portfolio Use">
            <p>Each party should protect non-public information received in connection with an engagement and use it only for the agreed purpose, subject to the applicable written agreement and lawful disclosure requirements.</p>
            <p>Client-identifying work will be presented in our portfolio only with the required permission. We may describe our general capabilities and non-confidential experience without disclosing protected client information.</p>
          </TermsSection>

          <TermsSection title="13. Third-Party Services">
            <p>Projects and website features may depend on hosting providers, databases, app stores, APIs, payment services, messaging services, open-source software, and other third parties. Their availability, policies, pricing, licences, and service changes are outside our direct control. Unless expressly agreed, Frontier DevConsults is not responsible for third-party outages, account decisions, or changes.</p>
          </TermsSection>

          <TermsSection title="14. Cancellation, Termination, Warranty, and Support">
            <p>Cancellation, termination rights, notice periods, payment for completed work, deposits, handover, refunds, warranties, defect correction, and post-launch support are governed by the applicable written agreement or marketplace contract. If no engagement agreement exists, either party may end non-binding discussions at any time.</p>
            <p>Maintenance, upgrades, hosting, monitoring, and support after delivery are included only when expressly stated.</p>
          </TermsSection>

          <TermsSection title="15. Disclaimers and Limitation of Liability">
            <p>To the extent permitted by applicable law, the public website and its informational features are provided without guarantees of uninterrupted availability, error-free operation, fitness for a particular purpose, or a specific commercial result. Nothing in these Terms excludes a right or liability that cannot lawfully be excluded.</p>
            <p>Liability relating to a paid engagement is governed first by its written agreement. To the extent permitted by law and where no engagement-specific term controls, Frontier DevConsults will not be liable for indirect, incidental, special, punitive, or consequential loss arising from use of the public website.</p>
          </TermsSection>

          <TermsSection title="16. Governing Law and Disputes">
            <p>These website Terms are governed by the laws of Ghana. The parties should first attempt to resolve a dispute through good-faith discussion. Where a marketplace agreement applies, its dispute process should be used as required. Otherwise, disputes are subject to the competent courts of Ghana, without limiting any mandatory consumer or statutory rights.</p>
          </TermsSection>

          <TermsSection title="17. Changes, Severability, and Contact">
            <p>We may update these Terms when services, providers, or legal requirements change. Revised Terms will be posted here with a new "Last updated" date. If part of these Terms is held unenforceable, the remaining provisions continue to apply to the extent legally possible.</p>
            <div className="rounded-lg bg-blue-50 p-6">
              <p className="mb-2 text-gray-800"><strong>Frontier DevConsults</strong></p>
              <p className="mb-1 text-gray-600">Email: info@frontier-devconsults.com</p>
              <p className="mb-1 text-gray-600">WhatsApp &amp; Phone: +233 249 078 976</p>
              <p className="mb-1 text-gray-600">Website: www.frontier-devconsults.com</p>
              <p className="text-gray-600">Location: Greater Accra, Ghana</p>
            </div>
          </TermsSection>

          <div className="mt-12 border-t border-gray-200 pt-8">
            <Link href="/" className="font-semibold text-blue-600 hover:text-blue-700">← Back to Home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function TermsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 text-gray-600 [&_a]:font-semibold [&_a]:text-blue-700 [&_a]:underline [&_h3]:mb-3 [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-800 [&_li]:mb-2 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}
