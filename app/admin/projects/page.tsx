'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Code2, Plus, Edit, Trash2 } from 'lucide-react';

export default function ProjectsPage() {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Projects</h1>
              <p className="text-gray-600 mt-2">Add, edit, or remove projects from your portfolio</p>
            </div>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
              <Plus className="w-5 h-5" />
              Add New Project
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Production</div>
            <div className="text-3xl font-bold text-green-600">2</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">In Development</div>
            <div className="text-3xl font-bold text-blue-600">2</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Planned</div>
            <div className="text-3xl font-bold text-gray-600">5</div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">All Projects</h2>
          </div>
          
          <div className="p-6">
            <div className="text-center py-12">
              <Code2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Project Management Coming Soon</h3>
              <p className="text-gray-600 mb-6">
                Currently, projects are managed directly in the code.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto text-left">
                <h4 className="font-bold text-blue-900 mb-3">📝 To enable project management:</h4>
                <ol className="list-decimal pl-6 text-blue-800 space-y-2">
                  <li>Set up a database with projects table</li>
                  <li>Create schema for: title, description, status, technologies, features, links, etc.</li>
                  <li>Build API endpoints to CRUD projects</li>
                  <li>Add upload functionality for project images/logos</li>
                  <li>Update homepage and projects page to fetch from database</li>
                </ol>
                <p className="text-blue-800 mt-4">
                  <strong>Current projects location:</strong> <code>/app/projects/page.tsx</code> and <code>/app/page.tsx</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
