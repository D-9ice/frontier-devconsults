'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, RefreshCcw, Save, XCircle } from 'lucide-react';
import { formatPriceRange, PricingSettings } from '@/lib/pricing';

type PricingRevision = {
  id: string;
  settings: PricingSettings;
  action: 'save' | 'restore';
  editorUsername: string;
  createdAt: string;
};

export default function AdminPricingPage() {
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [history, setHistory] = useState<PricingRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  useEffect(() => {
    loadPricing();
    loadHistory();
  }, []);

  const loadPricing = async () => {
    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/admin/pricing', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load pricing settings.');
      }

      setSettings(data);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to load pricing settings.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePricing = async () => {
    if (!settings) return;
    setIsSaving(true);
    setStatus(null);

    try {
      const response = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save pricing settings.');
      }

      setSettings(data.settings);
      await loadHistory();
      setStatus({ type: 'success', message: 'Pricing updated successfully. The public pricing page now uses these values.' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save pricing settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/admin/pricing?history=true', { cache: 'no-store' });
      if (response.ok) {
        setHistory(await response.json());
      }
    } catch {
      // The editor stays usable if history is unavailable during initial database setup.
    }
  };

  const restoreRevision = (revision: PricingRevision) => {
    setSettings(revision.settings);
    setStatus({
      type: 'success',
      message: `Revision from ${new Date(revision.createdAt).toLocaleString()} loaded. Save Pricing to make it live.`,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading pricing settings...</div>
      </main>
    );
  }

  if (!settings) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-sm">
          <XCircle className="mx-auto mb-3 h-10 w-10 text-red-600" />
          <p className="text-gray-800">Pricing settings could not be loaded.</p>
          <button
            onClick={() => loadPricing()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Pricing Editor</h1>
            <p className="mt-2 text-gray-600">
              Update exchange rate and base USD prices. The public page converts them to Ghana cedis automatically.
            </p>
          </div>
          <button
            onClick={savePricing}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {isSaving ? 'Saving...' : 'Save Pricing'}
          </button>
        </div>

        {status && (
          <div className={`mb-6 flex items-start gap-3 rounded-lg border p-4 ${
            status.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}>
            {status.type === 'success' ? <CheckCircle className="h-5 w-5 flex-shrink-0" /> : <XCircle className="h-5 w-5 flex-shrink-0" />}
            <p className="font-medium">{status.message}</p>
          </div>
        )}

        <section className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-gray-900">Exchange Rate Controls</h2>
          <div className="grid gap-5 md:grid-cols-3">
            <NumberField
              label="USD to GHS Rate"
              value={settings.exchangeRate}
              step="0.01"
              onChange={(value) => setSettings({ ...settings, exchangeRate: value })}
            />
            <NumberField
              label="Round Ghana Cedi Prices To"
              value={settings.roundingIncrement}
              step="50"
              onChange={(value) => setSettings({ ...settings, roundingIncrement: value })}
            />
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Last Updated</label>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700">
                {new Date(settings.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Public Pricing Note</label>
            <textarea
              value={settings.note}
              onChange={(event) => setSettings({ ...settings, note: event.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </section>

        <PriceSection
          title="Package Pricing"
          settings={settings}
          items={settings.tiers.map((tier) => ({ id: tier.id, label: tier.title, price: tier.price }))}
          onChange={(id, field, value) => {
            setSettings({
              ...settings,
              tiers: settings.tiers.map((tier) =>
                tier.id === id ? { ...tier, price: { ...tier.price, [field]: value || undefined } } : tier
              ),
            });
          }}
        />

        <PriceSection
          title="Development Services"
          settings={settings}
          items={settings.developmentServices.map((item) => ({ id: item.id, label: item.service, price: item.price }))}
          onChange={(id, field, value) => {
            setSettings({
              ...settings,
              developmentServices: settings.developmentServices.map((item) =>
                item.id === id ? { ...item, price: { ...item.price, [field]: value || undefined } } : item
              ),
            });
          }}
        />

        <PriceSection
          title="Additional Services"
          settings={settings}
          items={settings.additionalServices.map((item) => ({ id: item.id, label: item.service, price: item.price }))}
          onChange={(id, field, value) => {
            setSettings({
              ...settings,
              additionalServices: settings.additionalServices.map((item) =>
                item.id === id ? { ...item, price: { ...item.price, [field]: value || undefined } } : item
              ),
            });
          }}
        />

        <section className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-gray-900">Recent Pricing Revisions</h2>
          <p className="mb-5 text-sm text-gray-600">Load a previous revision, review it above, then save it to publish the rollback.</p>
          {history.length === 0 ? (
            <p className="text-sm text-gray-600">No saved revisions yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map((revision) => (
                <div key={revision.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      USD 1 = GH₵ {revision.settings.exchangeRate.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Saved {new Date(revision.createdAt).toLocaleString()} by {revision.editorUsername}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => restoreRevision(revision)}
                    className="rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    Load Revision
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  step: string;
  onChange: (value: number) => void;
}

function NumberField({ label, value, step, onChange }: NumberFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-600"
      />
    </div>
  );
}

interface PriceSectionProps {
  title: string;
  settings: PricingSettings;
  items: Array<{
    id: string;
    label: string;
    price: {
      minUsd: number;
      maxUsd?: number;
      suffix?: string;
    };
  }>;
  onChange: (id: string, field: 'minUsd' | 'maxUsd', value: number) => void;
}

function PriceSection({ title, settings, items, onChange }: PriceSectionProps) {
  return (
    <section className="mb-8 rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-bold text-gray-900">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
              <th className="pb-3 pr-4 font-semibold">Item</th>
              <th className="pb-3 pr-4 font-semibold">Min USD</th>
              <th className="pb-3 pr-4 font-semibold">Max USD</th>
              <th className="pb-3 font-semibold">Public GH₵ Preview</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 pr-4 font-medium text-gray-900">{item.label}</td>
                <td className="py-3 pr-4">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={item.price.minUsd}
                    onChange={(event) => onChange(item.id, 'minUsd', Number(event.target.value))}
                    className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-600"
                  />
                </td>
                <td className="py-3 pr-4">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={item.price.maxUsd ?? ''}
                    placeholder="No max"
                    onChange={(event) => onChange(item.id, 'maxUsd', Number(event.target.value))}
                    className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-600"
                  />
                </td>
                <td className="py-3 font-bold text-blue-600">{formatPriceRange(item.price, settings)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
