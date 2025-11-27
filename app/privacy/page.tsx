import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Frontier DevConsults - How we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  const lastUpdated = 'November 24, 2025';

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-300">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Frontier DevConsults ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. 
              This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
              www.frontier-devconsults.com or use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Personal Information</h3>
            <p className="text-gray-600 mb-4">We may collect the following personal information:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Name and contact information (email address, phone number)</li>
              <li>Company name and business details</li>
              <li>Project requirements and specifications</li>
              <li>Payment information (processed securely through third-party payment processors)</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>IP address and browser type</li>
              <li>Device information</li>
              <li>Usage data and analytics</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use your information for the following purposes:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>To provide and maintain our services</li>
              <li>To process your project requests and quotations</li>
              <li>To communicate with you about projects, updates, and marketing</li>
              <li>To improve our website and services</li>
              <li>To comply with legal obligations</li>
              <li>To protect against fraud and unauthorized access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-gray-600 mb-4">We do not sell your personal information. We may share your information with:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our business</li>
              <li><strong>Payment Processors:</strong> Secure payment gateways for transaction processing</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal data against 
              unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet 
              is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
            <p className="text-gray-600 mb-4">
              We use cookies and similar technologies to improve your browsing experience, analyze site traffic, and personalize content. 
              You can control cookies through your browser settings, but disabling cookies may affect site functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Links</h2>
            <p className="text-gray-600 mb-4">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. 
              We encourage you to review their privacy policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-600 mb-4">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information 
              from children.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update this privacy policy from time to time. We will notify you of any significant changes by posting the 
              new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-600 mb-4">If you have questions about this privacy policy or our data practices, please contact us:</p>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-800 mb-2"><strong>Frontier DevConsults</strong></p>
              <p className="text-gray-600 mb-1">Email: info@frontier-devconsults.com</p>
              <p className="text-gray-600 mb-1">Phone: +233 249 078 976</p>
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
