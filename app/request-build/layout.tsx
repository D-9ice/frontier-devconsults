import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Request a Custom Software or Engineering Build',
  description: 'Request a detailed proposal from Frontier DevConsults for a custom software, mobile, web, AI, embedded, electronics, or IoT project.',
  alternates: { canonical: '/request-build' },
  openGraph: { title: 'Request a Build | Frontier DevConsults', description: 'Submit your requirements for a custom software or engineering proposal.', url: '/request-build', type: 'website' },
};

export default function RequestBuildLayout({ children }: { children: React.ReactNode }) {
  return children;
}
