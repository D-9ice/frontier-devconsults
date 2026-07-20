'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileText, LoaderCircle, Mail, Phone, RefreshCw } from 'lucide-react';

type SubmissionType = 'contact' | 'build';
type Filter = 'all' | SubmissionType;

type Submission = {
  id: string;
  type: SubmissionType;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  project_type?: string | null;
  budget?: string | null;
  timeline?: string | null;
  description?: string | null;
  features?: string | null;
  reference_links?: string | null;
  message?: string | null;
  responded: boolean;
  created_at: string;
};

const tabs: Array<{ label: string; value: Filter }> = [
  { label: 'All Submissions', value: 'all' },
  { label: 'Contact Forms', value: 'contact' },
  { label: 'Build Requests', value: 'build' },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function SubmissionsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadSubmissions = useCallback(async (selectedFilter: Filter) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/submissions?type=${selectedFilter}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to load submissions.');
      setSubmissions(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load submissions.');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubmissions(filter);
  }, [filter, loadSubmissions]);

  async function setResponded(submission: Submission) {
    setUpdatingId(submission.id);
    setError('');

    try {
      const response = await fetch(`/api/admin/submissions/${submission.type}/${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responded: !submission.responded }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to update the submission.');

      setSubmissions((current) => current.map((item) => (
        item.id === submission.id && item.type === submission.type
          ? { ...item, responded: payload.responded }
          : item
      )));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update the submission.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/admin/dashboard" className="mb-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Form Submissions</h1>
            <p className="mt-2 text-gray-600">Review enquiries sent from the contact form and Request a Build page.</p>
          </div>
          <button
            type="button"
            onClick={() => void loadSubmissions(filter)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="mb-6 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
          <nav className="flex overflow-x-auto" aria-label="Submission filters">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilter(tab.value)}
                className={`whitespace-nowrap border-b-2 px-5 py-4 font-semibold transition-colors ${
                  filter === tab.value
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700" role="alert">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-lg bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-72 items-center justify-center gap-3 text-gray-600">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="mx-auto mb-4 h-14 w-14 text-gray-300" />
              <h2 className="text-xl font-semibold text-gray-900">No submissions yet</h2>
              <p className="mt-2 text-gray-600">New contact messages and build requests will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {submissions.map((submission) => (
                <article key={`${submission.type}-${submission.id}`} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${submission.type === 'contact' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'}`}>
                          {submission.type === 'contact' ? 'Contact form' : 'Build request'}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${submission.responded ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {submission.responded ? 'Responded' : 'Needs response'}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {submission.type === 'build' && submission.description?.split('\n')[0]
                          ? submission.description.split('\n')[0]
                          : submission.name}
                      </h2>
                      {submission.type === 'build' && <p className="mt-1 font-medium text-gray-700">From {submission.name}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => void setResponded(submission)}
                      disabled={updatingId === submission.id}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updatingId === submission.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {submission.responded ? 'Mark as pending' : 'Mark responded'}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                    <a href={`mailto:${submission.email}`} className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800">
                      <Mail className="h-4 w-4" /> {submission.email}
                    </a>
                    {submission.phone && (
                      <a href={`tel:${submission.phone}`} className="inline-flex items-center gap-2 hover:text-gray-900">
                        <Phone className="h-4 w-4" /> {submission.phone}
                      </a>
                    )}
                    <span>{formatDate(submission.created_at)}</span>
                  </div>

                  {submission.type === 'build' && (
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                      <div><dt className="font-medium text-gray-500">Project type</dt><dd className="mt-1 text-gray-800">{submission.project_type || 'Not specified'}</dd></div>
                      <div><dt className="font-medium text-gray-500">Budget</dt><dd className="mt-1 text-gray-800">{submission.budget || 'Not specified'}</dd></div>
                      <div><dt className="font-medium text-gray-500">Timeline</dt><dd className="mt-1 text-gray-800">{submission.timeline || 'Not specified'}</dd></div>
                    </dl>
                  )}

                  <div className="mt-4 whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-gray-700">
                    {submission.type === 'contact' ? submission.message : submission.description?.split('\n\n').slice(1).join('\n\n')}
                  </div>
                  {submission.features && <p className="mt-3 text-sm text-gray-600"><span className="font-semibold text-gray-700">Features:</span> {submission.features}</p>}
                  {submission.reference_links && <p className="mt-2 break-words text-sm text-gray-600"><span className="font-semibold text-gray-700">References:</span> {submission.reference_links}</p>}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
