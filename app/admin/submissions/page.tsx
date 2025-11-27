'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Mail, Phone, Calendar, ExternalLink } from 'lucide-react';

export default function SubmissionsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-600">Loading...</div>
    </div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Form Submissions</h1>
          <p className="text-gray-600 mt-2">View and manage contact form and build request submissions</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button className="py-4 px-1 border-b-2 border-blue-600 text-blue-600 font-semibold">
                All Submissions
              </button>
              <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                Contact Forms
              </button>
              <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                Build Requests
              </button>
            </nav>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
            <p className="text-gray-600 mb-6">
              Form submissions will appear here when visitors submit contact or build request forms.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto text-left">
              <h4 className="font-bold text-blue-900 mb-3">📝 To enable submission tracking:</h4>
              <ol className="list-decimal pl-6 text-blue-800 space-y-2">
                <li>Set up a database (PostgreSQL recommended)</li>
                <li>Create a submissions table to store form data</li>
                <li>Update the API routes in <code>/app/api/contact/</code> and <code>/app/api/request-build/</code></li>
                <li>Add database queries to save submissions</li>
                <li>Create GET endpoint to fetch submissions for this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
