'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminShortcut() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const closeGate = () => {
    setIsOpen(false);
    setPassword('');
    setError('');
    setShowPassword(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]')) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setPassword('');
        setError('');
        setIsOpen(true);
      }

      if (event.key === 'Escape') {
        closeGate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password) {
      setError('Enter your admin password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setError(data?.message || 'Unable to verify the password.');
        return;
      }

      closeGate();
      router.push('/admin/dashboard');
    } catch {
      setError('Unable to verify the password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="admin-shortcut-title">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white">
              <Lock size={21} aria-hidden="true" />
            </span>
            <div>
              <h2 id="admin-shortcut-title" className="text-xl font-bold text-slate-900">Admin Access</h2>
              <p className="text-sm text-slate-500">Frontier DevConsults Dashboard</p>
            </div>
          </div>
          <button type="button" onClick={closeGate} className="rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Close admin access">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <label className="mt-6 block text-sm font-semibold text-slate-700" htmlFor="admin-shortcut-password">Admin Password</label>
        <div className="relative mt-2">
          <input
            id="admin-shortcut-password"
            autoFocus
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 px-4 text-slate-500" aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          </button>
        </div>

        {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={isSubmitting} className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? 'Verifying...' : 'Access Dashboard'}
        </button>
      </form>
    </div>
  );
}
