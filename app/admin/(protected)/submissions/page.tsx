'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Archive, ArchiveRestore, ArrowLeft, CheckCircle2, FileText, LoaderCircle, Mail, Phone, RefreshCw, Search, StickyNote, Trash2 } from 'lucide-react';

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
  internal_notes?: string | null;
  responded: boolean;
  archived: boolean;
  created_at: string;
};

const tabs: Array<{ label: string; value: Filter }> = [
  { label: 'All Submissions', value: 'all' },
  { label: 'Contact Forms', value: 'contact' },
  { label: 'Build Requests', value: 'build' },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function SubmissionsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadSubmissions = useCallback(async (selectedFilter: Filter, archived: boolean) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/submissions?type=${selectedFilter}&archived=${archived}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to load submissions.');
      setSubmissions(payload);
      setNoteDrafts(Object.fromEntries(payload.map((item: Submission) => [`${item.type}-${item.id}`, item.internal_notes || ''])));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load submissions.');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubmissions(filter, showArchived);
  }, [filter, loadSubmissions, showArchived]);

  const visibleSubmissions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return submissions;
    return submissions.filter((submission) => [
      submission.name,
      submission.email,
      submission.company,
      submission.project_type,
      submission.message,
      submission.description,
      submission.features,
      submission.internal_notes,
    ].some((value) => value?.toLowerCase().includes(needle)));
  }, [search, submissions]);

  async function updateSubmission(submission: Submission, changes: Record<string, unknown>, action: string) {
    const key = `${action}-${submission.type}-${submission.id}`;
    setUpdatingKey(key);
    setError('');
    try {
      const response = await fetch(`/api/admin/submissions/${submission.type}/${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to update the submission.');

      if (changes.archived !== undefined) {
        setSubmissions((current) => current.filter((item) => !(item.id === submission.id && item.type === submission.type)));
      } else {
        setSubmissions((current) => current.map((item) => (
          item.id === submission.id && item.type === submission.type ? { ...item, ...payload } : item
        )));
      }
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update the submission.');
    } finally {
      setUpdatingKey(null);
    }
  }

  async function deleteSubmission(submission: Submission) {
    if (!window.confirm(`Permanently delete this ${submission.type === 'contact' ? 'contact submission' : 'build request'}? This cannot be undone.`)) return;

    const key = `delete-${submission.type}-${submission.id}`;
    setUpdatingKey(key);
    setError('');
    try {
      const response = await fetch(`/api/admin/submissions/${submission.type}/${submission.id}`, { method: 'DELETE' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to delete the submission.');
      setSubmissions((current) => current.filter((item) => !(item.id === submission.id && item.type === submission.type)));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete the submission.');
    } finally {
      setUpdatingKey(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/admin/dashboard" className="mb-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Form Submissions</h1>
            <p className="mt-2 text-gray-600">Review enquiries, keep private follow-up notes, and clear completed work from the inbox.</p>
          </div>
          <button type="button" onClick={() => void loadSubmissions(filter, showArchived)} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        <div className="mb-6 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
          <nav className="flex overflow-x-auto" aria-label="Submission filters">
            {tabs.map((tab) => (
              <button key={tab.value} type="button" onClick={() => setFilter(tab.value)} className={`whitespace-nowrap border-b-2 px-5 py-4 font-semibold transition-colors ${filter === tab.value ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, company, or content" className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <button type="button" onClick={() => setShowArchived((value) => !value)} className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 font-medium ${showArchived ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
            {showArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
            {showArchived ? 'Viewing archived' : 'View archived'}
          </button>
        </div>

        {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700" role="alert">{error}</div>}

        <section className="overflow-hidden rounded-lg bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-72 items-center justify-center gap-3 text-gray-600"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading submissions...</div>
          ) : visibleSubmissions.length === 0 ? (
            <div className="py-16 text-center"><FileText className="mx-auto mb-4 h-14 w-14 text-gray-300" /><h2 className="text-xl font-semibold text-gray-900">{showArchived ? 'No archived submissions' : 'No submissions yet'}</h2><p className="mt-2 text-gray-600">{search ? 'Try a different search.' : showArchived ? 'Archived enquiries will appear here.' : 'New contact messages and build requests will appear here.'}</p></div>
          ) : (
            <div className="divide-y divide-gray-200">
              {visibleSubmissions.map((submission) => {
                const submissionKey = `${submission.type}-${submission.id}`;
                const noteKey = `note-${submissionKey}`;
                const responseKey = `responded-${submissionKey}`;
                const archiveKey = `archive-${submissionKey}`;
                const deleteKey = `delete-${submissionKey}`;
                return (
                  <article key={submissionKey} className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${submission.type === 'contact' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'}`}>{submission.type === 'contact' ? 'Contact form' : 'Build request'}</span>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${submission.responded ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{submission.responded ? 'Responded' : 'Needs response'}</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">{submission.type === 'build' && submission.description?.split('\n')[0] ? submission.description.split('\n')[0] : submission.name}</h2>
                        {submission.type === 'build' && <p className="mt-1 font-medium text-gray-700">From {submission.name}</p>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => void updateSubmission(submission, { responded: !submission.responded }, 'responded')} disabled={updatingKey === responseKey} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                          {updatingKey === responseKey ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{submission.responded ? 'Mark pending' : 'Mark responded'}
                        </button>
                        <button type="button" onClick={() => void updateSubmission(submission, { archived: !submission.archived }, 'archive')} disabled={updatingKey === archiveKey} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60">
                          {updatingKey === archiveKey ? <LoaderCircle className="h-4 w-4 animate-spin" /> : submission.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}{submission.archived ? 'Restore' : 'Archive'}
                        </button>
                        <button type="button" onClick={() => void deleteSubmission(submission)} disabled={updatingKey === deleteKey} className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60" aria-label="Delete submission" title="Delete permanently">
                          {updatingKey === deleteKey ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                      <a href={`mailto:${submission.email}`} className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800"><Mail className="h-4 w-4" /> {submission.email}</a>
                      {submission.phone && <a href={`tel:${submission.phone}`} className="inline-flex items-center gap-2 hover:text-gray-900"><Phone className="h-4 w-4" /> {submission.phone}</a>}
                      <span>{formatDate(submission.created_at)}</span>
                    </div>

                    {submission.type === 'build' && <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><div><dt className="font-medium text-gray-500">Project type</dt><dd className="mt-1 text-gray-800">{submission.project_type || 'Not specified'}</dd></div><div><dt className="font-medium text-gray-500">Budget</dt><dd className="mt-1 text-gray-800">{submission.budget || 'Not specified'}</dd></div><div><dt className="font-medium text-gray-500">Timeline</dt><dd className="mt-1 text-gray-800">{submission.timeline || 'Not specified'}</dd></div></dl>}

                    <div className="mt-4 whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-gray-700">{submission.type === 'contact' ? submission.message : submission.description?.split('\n\n').slice(1).join('\n\n')}</div>
                    {submission.features && <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600"><span className="font-semibold text-gray-700">Features:</span> {submission.features}</p>}
                    {submission.reference_links && <p className="mt-2 break-words text-sm text-gray-600"><span className="font-semibold text-gray-700">References:</span> {submission.reference_links}</p>}

                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"><StickyNote className="h-4 w-4 text-blue-600" /> Internal notes</label>
                      <textarea value={noteDrafts[submissionKey] || ''} onChange={(event) => setNoteDrafts((current) => ({ ...current, [submissionKey]: event.target.value }))} rows={3} maxLength={5000} placeholder="Private follow-up notes for the Frontier DevConsults team" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                      <div className="mt-2 flex justify-end"><button type="button" onClick={() => void updateSubmission(submission, { internalNotes: noteDrafts[submissionKey] || '' }, 'note')} disabled={updatingKey === noteKey} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60">{updatingKey === noteKey && <LoaderCircle className="h-4 w-4 animate-spin" />}Save note</button></div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
