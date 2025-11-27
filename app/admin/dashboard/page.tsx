'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, FileText, Users, Settings, LogOut, Smartphone, Code2, Eye, Key } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingRequests: 0,
    activeProjects: 7,
    publishedApps: 1,
    appsInDevelopment: 3,
    totalVisitors: 0,
    visitsToday: 0,
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }
    setIsAuthenticated(true);

    // Load stats
    const loadStats = async () => {
      try {
        const response = await fetch('/api/track-visitor');
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          totalVisitors: data.totalVisitors || 0,
          visitsToday: data.visitsToday || 0,
        }));
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadStats();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-600">Loading...</div>
    </div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Code2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Frontier DevConsults</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 lg:grid-cols-7 gap-6 mb-8">
          <StatCard
            icon={<Eye className="w-8 h-8" />}
            title="Total Visitors"
            value={stats.totalVisitors}
            color="indigo"
          />
          <StatCard
            icon={<Eye className="w-8 h-8" />}
            title="Today's Visits"
            value={stats.visitsToday}
            color="cyan"
          />
          <StatCard
            icon={<FileText className="w-8 h-8" />}
            title="Total Submissions"
            value={stats.totalSubmissions}
            color="blue"
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="Pending Requests"
            value={stats.pendingRequests}
            color="yellow"
          />
          <StatCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Active Projects"
            value={stats.activeProjects}
            color="green"
          />
          <StatCard
            icon={<Smartphone className="w-8 h-8" />}
            title="Published Apps"
            value={stats.publishedApps}
            color="purple"
          />
          <StatCard
            icon={<Code2 className="w-8 h-8" />}
            title="Apps in Dev"
            value={stats.appsInDevelopment}
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <ActionButton
              href="/admin/app-store"
              icon={<Smartphone className="w-5 h-5" />}
              label="Manage App Store"
            />
            <ActionButton
              href="/admin/submissions"
              icon={<FileText className="w-5 h-5" />}
              label="View Submissions"
            />
            <ActionButton
              href="/admin/projects"
              icon={<Code2 className="w-5 h-5" />}
              label="Manage Projects"
            />
            <ActionButton
              href="/admin/settings"
              icon={<Settings className="w-5 h-5" />}
              label="Settings"
            />
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="text-gray-600 group-hover:text-blue-600 transition-colors">
                <Key className="w-5 h-5" />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                Change Password
              </span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-gray-600 text-center py-8">
            <p>No recent activity to display.</p>
            <p className="text-sm mt-2">Form submissions will appear here when received.</p>
          </div>
        </div>

        {/* Implementation Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">📝 Implementation Note</h3>
          <p className="text-blue-800 mb-4">
            This is a basic admin dashboard structure. To make it fully functional, you'll need to:
          </p>
          <ul className="list-disc pl-6 text-blue-800 space-y-2">
            <li>Set up a database (PostgreSQL with Prisma recommended)</li>
            <li>Create API endpoints in <code>/app/api/admin/</code></li>
            <li>Implement proper authentication (NextAuth.js or JWT)</li>
            <li>Add pages for viewing submissions, managing projects, etc.</li>
            <li>Connect form submissions to database storage</li>
            <li>Visitor counter requires analytics integration (Google Analytics, Vercel Analytics, or custom tracking)</li>
          </ul>
          <p className="text-blue-800 mt-4">
            For now, this provides the UI structure and basic auth flow.
          </p>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />}
    </main>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: 'blue' | 'yellow' | 'green' | 'purple' | 'orange' | 'indigo' | 'cyan';
}

function StatCard({ icon, title, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    cyan: 'bg-cyan-100 text-cyan-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface ActionButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function ActionButton({ href, icon, label }: ActionButtonProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
    >
      <div className="text-gray-600 group-hover:text-blue-600 transition-colors">
        {icon}
      </div>
      <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
        {label}
      </span>
    </Link>
  );
}

interface PasswordChangeModalProps {
  onClose: () => void;
}

function PasswordChangeModal({ onClose }: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password changed successfully!');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-gray-900 bg-white"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-4">
          Note: Password must be at least 8 characters long.
        </p>
      </div>
    </div>
  );
}
