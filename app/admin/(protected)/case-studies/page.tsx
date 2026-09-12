import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CaseStudyManager } from '@/components/admin/CaseStudyManager';

export default function AdminCaseStudiesPage() {
  return <main className="min-h-screen bg-gray-50">
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/admin/projects" className="mb-4 inline-flex items-center gap-2 text-blue-700 hover:text-blue-900"><ArrowLeft className="h-4 w-4" /> Back to Projects</Link>
      <h1 className="text-3xl font-bold text-gray-900">Case Study Publisher</h1>
      <p className="mt-2 max-w-3xl text-gray-600">Build evidence-controlled case studies from existing project and product records. Draft and private evidence is never shown publicly.</p>
      <CaseStudyManager />
    </div>
  </main>;
}
