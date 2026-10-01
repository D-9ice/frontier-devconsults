'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Ban,
  Check,
  Copy,
  Cpu,
  KeyRound,
  Laptop,
  LoaderCircle,
  Plus,
  RefreshCw,
  RotateCcwKey,
  ShieldCheck,
  ShieldOff,
  TimerReset,
  X,
} from 'lucide-react';

type LicenseStatus = 'active' | 'suspended' | 'expired' | 'revoked';
type LicenseType = 'evaluation' | 'commercial' | 'dealer' | 'site' | 'development';
type ActivationStatus = 'active' | 'deactivated' | 'revoked';

type Activation = {
  id: string;
  installation_id: string;
  hardware_device_id: string | null;
  status: ActivationStatus;
  first_activated_at: string;
  last_validated_at: string;
  last_seen_at: string;
  app_version: string | null;
};

type License = {
  id: string;
  license_key_last4: string;
  customer_name: string;
  license_type: LicenseType;
  status: LicenseStatus;
  max_installations: number;
  valid_from: string;
  expires_at: string | null;
  revalidate_days: number;
  offline_grace_days: number;
  brand_profile: Record<string, unknown>;
  modules: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
  treadmill_license_activations?: Activation[];
};

type Stats = {
  totalLicenses: number;
  activeLicenses: number;
  expiringSoon: number;
  activeInstallations: number;
  failedAuth24h: number;
};

type Detail = {
  license: License;
  events: Array<{
    id: number;
    activation_id: string | null;
    installation_id: string | null;
    event_type: string;
    success: boolean;
    created_at: string;
  }>;
  engineeringSessions: Array<{
    id: string;
    activation_id: string;
    installation_id: string;
    expires_at: string;
    revoked_at: string | null;
    created_at: string;
  }>;
};

const initialForm = {
  customerName: '',
  licenseType: 'commercial' as LicenseType,
  maxInstallations: 1,
  expiresAt: '',
  revalidateDays: 7,
  offlineGraceDays: 30,
  brandName: '',
  consoleName: 'Frontier Universal Treadmill Console',
  shortName: '',
  logoUrl: '/frontier-universal-treadmill-console.webp',
  accentColor: '#10B981',
  devicePrefix: 'FRONTIER-TM',
  deploymentLabel: '',
  modules: 'console, media, engineering, white_label',
  notes: '',
};

export default function TreadmillLicensingAdminPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalLicenses: 0,
    activeLicenses: 0,
    expiringSoon: 0,
    activeInstallations: 0,
    failedAuth24h: 0,
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeError, setNoticeError] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [credentials, setCredentials] = useState<{ licenseKey?: string; engineeringCredential?: string; title: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/treadmill-licenses', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load treadmill licenses.');
      setLicenses(data.licenses || []);
      setStats(data.stats || {});
    } catch (error) {
      setNoticeError(true);
      setNotice(error instanceof Error ? error.message : 'Unable to load treadmill licenses.');
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(id: string) {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const response = await fetch('/api/admin/treadmill-licenses/' + id, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load license detail.');
      setDetail(data);
    } catch (error) {
      setNoticeError(true);
      setNotice(error instanceof Error ? error.message : 'Unable to load license detail.');
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function refresh() {
    await load();
    if (selectedId) await loadDetail(selectedId);
  }

  useEffect(() => { void load(); }, []);

  async function createLicense(event: FormEvent) {
    event.preventDefault();
    setBusy('create');
    setNotice('');
    try {
      const customer = form.customerName.trim();
      const shortName = form.shortName.trim() || customer.slice(0, 12).toUpperCase();
      const logo = form.logoUrl.trim() || '/frontier-universal-treadmill-console.webp';
      const payload = {
        customerName: customer,
        licenseType: form.licenseType,
        maxInstallations: form.maxInstallations,
        expiresAt: form.expiresAt || null,
        revalidateDays: form.revalidateDays,
        offlineGraceDays: form.offlineGraceDays,
        brandProfile: {
          brandName: form.brandName.trim() || customer,
          consoleName: form.consoleName.trim() || 'Frontier Universal Treadmill Console',
          shortName,
          welcomeKicker: 'WELCOME TO',
          welcomeTitle: shortName.toUpperCase(),
          signOutTitle: shortName.toUpperCase(),
          logoUrl: logo,
          installIconUrl: logo,
          accentColor: form.accentColor,
          devicePrefix: form.devicePrefix.trim().toUpperCase() || 'FRONTIER-TM',
          deploymentLabel: form.deploymentLabel.trim() || customer + ' Deployment',
        },
        modules: form.modules.split(',').map((item) => item.trim()).filter(Boolean),
        notes: form.notes || null,
      };
      const response = await fetch('/api/admin/treadmill-licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'License creation failed.');
      setCredentials({
        title: 'Credentials issued for ' + customer,
        licenseKey: data.licenseKey,
        engineeringCredential: data.engineeringCredential,
      });
      setForm(initialForm);
      setShowCreate(false);
      await load();
      if (data.license && data.license.id) await loadDetail(data.license.id);
    } catch (error) {
      setNoticeError(true);
      setNotice(error instanceof Error ? error.message : 'License creation failed.');
    } finally {
      setBusy('');
    }
  }

  async function action(licenseId: string, actionName: string, extra: Record<string, unknown> = {}, confirmation?: string) {
    if (confirmation && !window.confirm(confirmation)) return;
    setBusy(licenseId + ':' + actionName);
    setNotice('');
    try {
      const response = await fetch('/api/admin/treadmill-licenses/' + licenseId + '/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionName, ...extra }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'License action failed.');
      if (data.engineeringCredential) {
        setCredentials({ title: 'New Engineering credential', engineeringCredential: data.engineeringCredential });
      } else {
        setNoticeError(false);
        setNotice('Administrative action completed.');
      }
      await refresh();
    } catch (error) {
      setNoticeError(true);
      setNotice(error instanceof Error ? error.message : 'License action failed.');
    } finally {
      setBusy('');
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-black">Treadmill Licensing & Device Control</h1>
            <p className="mt-2 max-w-3xl text-gray-600">
              Issue Frontier Universal Treadmill Console licenses, manage customer access, control installations, rotate Engineering credentials and review licensing activity.
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void refresh()} disabled={loading || Boolean(busy)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-bold text-gray-800 hover:bg-gray-50 disabled:opacity-50">
              <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /> Refresh
            </button>
            <button type="button" onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 font-bold text-white hover:bg-blue-800">
              <Plus className="h-4 w-4" /> Issue License
            </button>
          </div>
        </div>

        {notice ? <div className={(noticeError ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800') + ' mt-6 rounded-lg border p-4'}>{notice}</div> : null}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Stat icon={<KeyRound className="h-5 w-5" />} label="Total Licenses" value={stats.totalLicenses} />
          <Stat icon={<ShieldCheck className="h-5 w-5" />} label="Active Licenses" value={stats.activeLicenses} />
          <Stat icon={<Laptop className="h-5 w-5" />} label="Active Installations" value={stats.activeInstallations} />
          <Stat icon={<TimerReset className="h-5 w-5" />} label="Expiring 30 Days" value={stats.expiringSoon} />
          <Stat icon={<AlertTriangle className="h-5 w-5" />} label="Failed Auth 24h" value={stats.failedAuth24h} />
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.35fr]">
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <h2 className="text-lg font-black">Customer Licenses</h2>
              <p className="text-sm text-gray-600">Select a license to manage access and devices.</p>
            </div>
            {loading ? <p className="p-6 text-gray-600">Loading licenses...</p> : licenses.length === 0 ? <p className="p-8 text-center text-gray-500">No treadmill licenses issued.</p> : (
              <div className="divide-y divide-gray-100">
                {licenses.map((license) => {
                  const active = (license.treadmill_license_activations || []).filter((item) => item.status === 'active').length;
                  return (
                    <button type="button" key={license.id} onClick={() => void loadDetail(license.id)} className={(selectedId === license.id ? 'bg-blue-50 ' : '') + 'w-full p-5 text-left hover:bg-gray-50'}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-black">{license.customer_name}</p>
                          <p className="mt-1 text-xs font-mono text-gray-500">{'FTC-••••-••••-••••-' + license.license_key_last4}</p>
                        </div>
                        <StatusBadge status={license.status} />
                      </div>
                      <p className="mt-3 text-xs text-gray-600">{pretty(license.license_type) + ' · ' + active + '/' + license.max_installations + ' active installations'}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="min-h-[460px] rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {!selectedId ? (
              <div className="flex min-h-[380px] flex-col items-center justify-center text-center text-gray-500">
                <KeyRound className="mb-3 h-10 w-10 text-gray-300" />
                <p className="font-bold text-gray-700">Select a customer license</p>
                <p className="mt-1 text-sm">Administrative controls, installations and audit activity will appear here.</p>
              </div>
            ) : detailLoading ? (
              <div className="flex items-center gap-2 text-gray-600"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading license detail...</div>
            ) : detail ? (
              <LicenseDetail detail={detail} busy={busy} onAction={action} />
            ) : null}
          </section>
        </div>
      </div>

      {showCreate ? <CreateModal form={form} setForm={setForm} saving={busy === 'create'} onClose={() => setShowCreate(false)} onSubmit={createLicense} /> : null}
      {credentials ? <CredentialModal data={credentials} onClose={() => setCredentials(null)} /> : null}
    </main>
  );
}

function LicenseDetail({ detail, busy, onAction }: { detail: Detail; busy: string; onAction: (licenseId: string, actionName: string, extra?: Record<string, unknown>, confirmation?: string) => Promise<void> }) {
  const license = detail.license;
  const activations = license.treadmill_license_activations || [];
  const activeSessions = detail.engineeringSessions.filter((item) => !item.revoked_at && new Date(item.expires_at) > new Date()).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><h2 className="text-2xl font-black">{license.customer_name}</h2><StatusBadge status={license.status} /></div>
          <p className="mt-1 text-sm text-gray-600">{pretty(license.license_type) + ' · FTC-••••-••••-••••-' + license.license_key_last4}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {license.status !== 'active' && license.status !== 'revoked' ? <Control icon={<Check className="h-4 w-4" />} label="Allow" tone="green" disabled={Boolean(busy)} onClick={() => void onAction(license.id, 'allow')} /> : null}
          {license.status === 'active' ? <Control icon={<ShieldOff className="h-4 w-4" />} label="Suspend" tone="amber" disabled={Boolean(busy)} onClick={() => void onAction(license.id, 'suspend', {}, 'Suspend this customer license?')} /> : null}
          {license.status !== 'revoked' ? <Control icon={<Ban className="h-4 w-4" />} label="Revoke" tone="red" disabled={Boolean(busy)} onClick={() => void onAction(license.id, 'revoke', {}, 'Permanently revoke this license?')} /> : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Mini label="Installations" value={String(activations.filter((item) => item.status === 'active').length) + '/' + String(license.max_installations)} />
        <Mini label="Revalidate" value={String(license.revalidate_days) + ' days'} />
        <Mini label="Offline grace" value={String(license.offline_grace_days) + ' days'} />
        <Mini label="Expiry" value={license.expires_at ? displayDate(license.expires_at) : 'No fixed expiry'} />
      </div>

      <section className="rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="font-black">Engineering Access</h3><p className="text-sm text-gray-600">{String(activeSessions) + ' active Engineering session(s)'}</p></div>
          <div className="flex gap-2">
            <Control icon={<RotateCcwKey className="h-4 w-4" />} label="Rotate Credential" tone="blue" disabled={Boolean(busy)} onClick={() => void onAction(license.id, 'rotate-engineering-credential', {}, 'Rotate the Engineering credential and revoke existing Engineering sessions?')} />
            <Control icon={<ShieldOff className="h-4 w-4" />} label="Revoke Sessions" tone="gray" disabled={Boolean(busy)} onClick={() => void onAction(license.id, 'revoke-engineering-sessions')} />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2"><Cpu className="h-5 w-5 text-blue-700" /><h3 className="text-lg font-black">Activated Installations</h3></div>
        {activations.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 p-5 text-sm text-gray-500">No console has activated this license yet.</div> : (
          <div className="space-y-3">
            {activations.map((item) => (
              <article key={item.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2"><p className="break-all font-mono text-xs font-bold">{item.installation_id}</p><ActivationBadge status={item.status} /></div>
                    <p className="mt-1 text-xs text-gray-500">{'Hardware: ' + (item.hardware_device_id || 'Not bound') + ' · App: ' + (item.app_version || 'Unknown')}</p>
                    <p className="mt-1 text-xs text-gray-500">{'Last validated ' + displayDateTime(item.last_validated_at)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.status !== 'active' ? <Control icon={<Check className="h-4 w-4" />} label="Allow Device" tone="green" disabled={Boolean(busy)} onClick={() => void onAction(license.id, 'activation-status', { activationId: item.id, activationStatus: 'active' })} /> : null}
                    {item.status === 'active' ? <Control icon={<ShieldOff className="h-4 w-4" />} label="Deactivate" tone="amber" disabled={Boolean(busy)} onClick={() => void onAction(license.id, 'activation-status', { activationId: item.id, activationStatus: 'deactivated' }, 'Deactivate this installation?')} /> : null}
                    {item.status !== 'revoked' ? <Control icon={<Ban className="h-4 w-4" />} label="Revoke Device" tone="red" disabled={Boolean(busy)} onClick={() => void onAction(license.id, 'activation-status', { activationId: item.id, activationStatus: 'revoked' }, 'Permanently revoke this installation?')} /> : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2"><Activity className="h-5 w-5 text-violet-700" /><h3 className="text-lg font-black">Recent License Events</h3></div>
        <div className="max-h-72 overflow-auto rounded-xl border border-gray-200">
          {detail.events.length === 0 ? <p className="p-5 text-sm text-gray-500">No license events recorded.</p> : detail.events.map((event) => (
            <div key={event.id} className="flex items-start justify-between gap-3 border-b border-gray-100 p-3 text-sm last:border-b-0">
              <div><p className="font-bold">{pretty(event.event_type)}</p><p className="mt-0.5 break-all text-xs text-gray-500">{event.installation_id || 'No installation id'}</p></div>
              <div className="text-right"><span className={(event.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') + ' rounded-full px-2 py-0.5 text-xs font-bold'}>{event.success ? 'SUCCESS' : 'FAILED'}</span><p className="mt-1 text-xs text-gray-500">{displayDateTime(event.created_at)}</p></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CreateModal({ form, setForm, saving, onClose, onSubmit }: { form: typeof initialForm; setForm: (value: typeof initialForm) => void; saving: boolean; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  function update(key: keyof typeof initialForm, value: string | number) {
    setForm({ ...form, [key]: value });
  }
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/55 p-4">
      <div className="mx-auto my-6 max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div><h2 className="text-xl font-black">Issue Treadmill License</h2><p className="text-sm text-gray-600">Creates a customer license and separate Engineering credential.</p></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Text label="Customer / Company" value={form.customerName} onChange={(value) => update('customerName', value)} required />
            <label className="text-sm font-bold text-gray-700">License Type<select value={form.licenseType} onChange={(event) => update('licenseType', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"><option value="evaluation">Evaluation</option><option value="commercial">Commercial</option><option value="dealer">Dealer</option><option value="site">Site</option><option value="development">Development</option></select></label>
            <NumberInput label="Maximum Installations" value={form.maxInstallations} min={1} max={10000} onChange={(value) => update('maxInstallations', value)} />
            <label className="text-sm font-bold text-gray-700">Expiry Date<input type="date" value={form.expiresAt} onChange={(event) => update('expiresAt', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" /></label>
            <NumberInput label="Online Revalidation (days)" value={form.revalidateDays} min={1} max={90} onChange={(value) => update('revalidateDays', value)} />
            <NumberInput label="Offline Grace (days)" value={form.offlineGraceDays} min={1} max={365} onChange={(value) => update('offlineGraceDays', value)} />
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <h3 className="font-black text-blue-950">White-Label Deployment Profile</h3>
            <p className="mt-1 text-sm text-blue-800">Applied automatically when the customer license activates.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Text label="Displayed Brand" value={form.brandName} onChange={(value) => update('brandName', value)} />
              <Text label="Console Product Name" value={form.consoleName} onChange={(value) => update('consoleName', value)} />
              <Text label="Short Brand Name" value={form.shortName} onChange={(value) => update('shortName', value)} />
              <Text label="Logo URL / App Path" value={form.logoUrl} onChange={(value) => update('logoUrl', value)} />
              <Text label="Device Prefix" value={form.devicePrefix} onChange={(value) => update('devicePrefix', value)} />
              <Text label="Deployment Label" value={form.deploymentLabel} onChange={(value) => update('deploymentLabel', value)} />
              <Text label="Accent Color" value={form.accentColor} onChange={(value) => update('accentColor', value)} />
              <Text label="Enabled Modules" value={form.modules} onChange={(value) => update('modules', value)} />
            </div>
          </div>

          <label className="block text-sm font-bold text-gray-700">Administrative Notes<textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" /></label>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><strong>Important:</strong> the raw license key and Engineering credential are displayed only once after creation.</div>
          <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-5 py-2.5 font-bold text-gray-700">Cancel</button><button type="submit" disabled={saving || !form.customerName.trim()} className="rounded-lg bg-blue-700 px-5 py-2.5 font-bold text-white disabled:opacity-50">{saving ? 'Issuing...' : 'Issue License'}</button></div>
        </form>
      </div>
    </div>
  );
}

function CredentialModal({ data, onClose }: { data: { licenseKey?: string; engineeringCredential?: string; title: string }; onClose: () => void }) {
  const [copied, setCopied] = useState('');
  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(''), 1200);
  }
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-black">{data.title}</h2><p className="mt-1 text-sm font-bold text-red-700">Copy these credentials now. They will not be shown again.</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-500"><X className="h-5 w-5" /></button></div>
        <div className="mt-5 space-y-4">
          {data.licenseKey ? <Secret label="License Key" value={data.licenseKey} copied={copied === 'license'} onCopy={() => void copy('license', data.licenseKey || '')} /> : null}
          {data.engineeringCredential ? <Secret label="Engineering Credential" value={data.engineeringCredential} copied={copied === 'engineering'} onCopy={() => void copy('engineering', data.engineeringCredential || '')} /> : null}
        </div>
        <button type="button" onClick={onClose} className="mt-6 w-full rounded-lg bg-gray-950 px-4 py-3 font-bold text-white">I have securely saved the credentials</button>
      </div>
    </div>
  );
}

function Secret({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p><div className="mt-2 flex gap-2"><code className="min-w-0 flex-1 break-all rounded-lg bg-gray-950 px-3 py-2.5 text-sm font-bold text-green-300">{value}</code><button type="button" onClick={onCopy} className="rounded-lg border border-gray-300 bg-white p-2.5">{copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}</button></div></div>;
}
function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) { return <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-blue-700">{icon}<p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p></div><p className="mt-2 text-3xl font-black">{value}</p></div>; }
function Mini({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p><p className="mt-1 font-black">{value}</p></div>; }
function StatusBadge({ status }: { status: LicenseStatus }) { const style = status === 'active' ? 'bg-green-100 text-green-800' : status === 'suspended' ? 'bg-amber-100 text-amber-900' : status === 'revoked' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-800'; return <span className={style + ' rounded-full px-2.5 py-1 text-xs font-black uppercase'}>{status}</span>; }
function ActivationBadge({ status }: { status: ActivationStatus }) { const style = status === 'active' ? 'bg-green-100 text-green-800' : status === 'deactivated' ? 'bg-amber-100 text-amber-900' : 'bg-red-100 text-red-800'; return <span className={style + ' rounded-full px-2 py-0.5 text-[10px] font-black uppercase'}>{status}</span>; }
function Control({ icon, label, tone, disabled, onClick }: { icon: React.ReactNode; label: string; tone: 'green' | 'amber' | 'red' | 'blue' | 'gray'; disabled: boolean; onClick: () => void }) { const styles = { green: 'border-green-200 bg-green-50 text-green-800', amber: 'border-amber-200 bg-amber-50 text-amber-900', red: 'border-red-200 bg-red-50 text-red-800', blue: 'border-blue-200 bg-blue-50 text-blue-800', gray: 'border-gray-300 bg-white text-gray-700' }; return <button type="button" disabled={disabled} onClick={onClick} className={styles[tone] + ' inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-50'}>{icon}{label}</button>; }
function Text({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="text-sm font-bold text-gray-700">{label}<input required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" /></label>; }
function NumberInput({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) { return <label className="text-sm font-bold text-gray-700">{label}<input type="number" value={value} min={min} max={max} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" /></label>; }
function pretty(value: string) { return value.replaceAll('_', ' ').replace(/\b\w/g, (match) => match.toUpperCase()); }
function displayDate(value: string) { return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value)); }
function displayDateTime(value: string) { return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
