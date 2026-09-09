import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact a Software Development Company in Accra',
  description: 'Contact Frontier DevConsults in Greater Accra, Ghana for custom software, mobile apps, web platforms, AI integration, embedded systems, and IoT projects.',
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Contact Frontier DevConsults in Accra, Ghana', description: 'Discuss a software or engineering project with Frontier DevConsults.', url: '/contact', type: 'website' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
