import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Frontier DevConsults - Legal terms and conditions for using our services.',
};

export default function TermsPage() {
  const lastUpdated = 'November 24, 2025';

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-300">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing or using the services provided by Frontier DevConsults ("Company," "we," "our," or "us"), 
              you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Services Description</h2>
            <p className="text-gray-600 mb-4">
              Frontier DevConsults provides software development services including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Mobile application development</li>
              <li>Web application development</li>
              <li>E-commerce solutions</li>
              <li>AI integration and machine learning services</li>
              <li>Custom software solutions</li>
              <li>Maintenance and support services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Project Engagement</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Quotations and Proposals</h3>
            <p className="text-gray-600 mb-4">
              All quotations are valid for 30 days unless otherwise specified. Final project costs may vary based on 
              scope changes or unforeseen requirements.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Project Scope</h3>
            <p className="text-gray-600 mb-4">
              A detailed scope of work will be provided and must be agreed upon before project commencement. Any changes 
              to the scope may affect timeline and cost.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Timeline</h3>
            <p className="text-gray-600 mb-4">
              Estimated timelines are provided in good faith. Delays caused by client feedback, scope changes, or 
              third-party dependencies may extend the timeline.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payment Terms</h2>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>Upfront Payment:</strong> 30% of total project cost upon agreement signing</li>
              <li><strong>Milestone Payment:</strong> 40% upon completion of development phase</li>
              <li><strong>Final Payment:</strong> 30% upon project delivery and approval</li>
              <li><strong>Late Payments:</strong> Overdue payments may incur a 2% monthly interest charge</li>
              <li><strong>Accepted Methods:</strong> MTN Mobile Money, Vodafone Cash, AirtelTigo Money, Zeepay, Visa, Mastercard</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Client Ownership</h3>
            <p className="text-gray-600 mb-4">
              Upon full payment, the client owns all custom code and deliverables created specifically for their project.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Company Ownership</h3>
            <p className="text-gray-600 mb-4">
              We retain ownership of all pre-existing code, frameworks, libraries, and development tools used in the project. 
              The client receives a license to use these components as part of the delivered solution.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Third-Party Components</h3>
            <p className="text-gray-600 mb-4">
              Third-party libraries and services are subject to their respective licenses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Client Responsibilities</h2>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Provide timely feedback and approvals</li>
              <li>Supply required content, assets, and credentials</li>
              <li>Ensure third-party services and accounts are properly configured</li>
              <li>Maintain communication throughout the project</li>
              <li>Make payments according to agreed schedule</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Warranties and Limitations</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Warranty Period</h3>
            <p className="text-gray-600 mb-4">
              We provide a 30-day warranty for bug fixes on delivered projects. This covers defects in our original work, 
              not new features or changes to requirements.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Limitation of Liability</h3>
            <p className="text-gray-600 mb-4">
              Our total liability shall not exceed the total amount paid for the specific project. We are not liable for 
              indirect, consequential, or punitive damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Confidentiality</h2>
            <p className="text-gray-600 mb-4">
              Both parties agree to keep confidential information private. We will not disclose client project details 
              without permission, except when showcasing work in our portfolio (with client approval).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 By Client</h3>
            <p className="text-gray-600 mb-4">
              Clients may terminate the project with 14 days' written notice. Client remains responsible for payment of 
              work completed to date.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2 By Company</h3>
            <p className="text-gray-600 mb-4">
              We may terminate if client fails to make payments, provide necessary materials, or violates these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Support and Maintenance</h2>
            <p className="text-gray-600 mb-4">
              Post-launch support and maintenance services are available separately. Details and pricing will be provided 
              in a separate agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Dispute Resolution</h2>
            <p className="text-gray-600 mb-4">
              Any disputes will first be attempted to be resolved through good-faith negotiation. If unsuccessful, disputes 
              will be subject to the laws of Ghana and the jurisdiction of courts in Greater Accra.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify these terms at any time. Continued use of our services after changes 
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-800 mb-2"><strong>Frontier DevConsults</strong></p>
              <p className="text-gray-600 mb-1">Email: info@frontier-devconsults.com</p>
              <p className="text-gray-600 mb-1">Phone: +233 249 078 976</p>
              <p className="text-gray-600 mb-1">Website: www.frontier-devconsults.com</p>
              <p className="text-gray-600">Location: Greater Accra, Ghana</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
