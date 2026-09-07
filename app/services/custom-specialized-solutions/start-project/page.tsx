import type { Metadata } from 'next';
import SpecializedProjectForm from '@/components/SpecializedProjectForm';

export const metadata: Metadata = {
  title: 'Start a Specialized Engineering Project',
  description: 'Describe the technical, physical, control, monitoring, and software requirements for a Frontier DevConsults specialized engineering assessment.',
  alternates: { canonical: '/services/custom-specialized-solutions/start-project' },
  robots: { index: false, follow: true },
};

export default function StartSpecializedProjectPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-slate-950 to-blue-900 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-300">Custom Specialized Solutions</p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">Specialized Engineering Project</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">Share what you are building, controlling, monitoring, repairing, or modernizing. Provide what you know and choose a Frontier assessment wherever the requirements are not yet clear.</p>
        </div>
      </section>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-6"><SpecializedProjectForm /></div>
      </section>
    </main>
  );
}
