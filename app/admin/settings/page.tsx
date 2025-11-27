'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Settings as SettingsIcon, Globe, Mail, Shield, Database } from 'lucide-react';

export default function SettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    totalVisitors: number;
    loading: boolean;
  }>({ connected: false, totalVisitors: 0, loading: true });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }
    setIsAuthenticated(true);
    
    // Check database connection status
    fetch('/api/track-visitor')
      .then(res => res.json())
      .then(data => {
        setDbStatus({
          connected: true,
          totalVisitors: data.totalVisitors || 0,
          loading: false,
        });
      })
      .catch(() => {
        setDbStatus({
          connected: false,
          totalVisitors: 0,
          loading: false,
        });
      });
  }, [router]);

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-600">Loading...</div>
    </div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure your admin dashboard and website settings</p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Website Title
                </label>
                <input
                  type="text"
                  defaultValue="Frontier DevConsults"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 bg-white"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="text"
                  defaultValue="https://www.frontier-devconsults.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 bg-white"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Email Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  defaultValue="info@frontier-devconsults.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 bg-white"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Service Provider
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 bg-white"
                  disabled
                >
                  <option>Not Configured</option>
                  <option>Resend</option>
                  <option>SendGrid</option>
                  <option>SMTP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-900">Admin Password</div>
                  <div className="text-sm text-gray-600">Last changed: Never</div>
                </div>
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Change Password
                </Link>
              </div>
            </div>
          </div>

          {/* Database Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Database Settings</h2>
            </div>
            {dbStatus.loading ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600">Checking database connection...</p>
              </div>
            ) : dbStatus.connected ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold mb-2">✅ Database Connected - {dbStatus.totalVisitors} visitors tracked</p>
                <p className="text-green-700 text-sm">
                  Supabase is connected and actively tracking visitor data, form submissions, and dynamic content.
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold mb-2">❌ Database Disconnected</p>
                <p className="text-red-700 text-sm">
                  Unable to connect to Supabase. Please check your environment variables and database configuration.
                </p>
              </div>
            )}
          </div>

          {/* Implementation Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-3">📝 Implementation Note</h3>
            <p className="text-blue-800 mb-4">
              Settings are currently hard-coded. To make them editable:
            </p>
            <ol className="list-decimal pl-6 text-blue-800 space-y-2">
              <li>Set up a database with settings table</li>
              <li>Create API endpoints to save/load settings</li>
              <li>Add form submission handlers</li>
              <li>Update environment variables programmatically (or use database config)</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
