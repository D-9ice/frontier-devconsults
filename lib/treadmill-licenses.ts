import 'server-only';

import crypto from 'node:crypto';
import { supabaseServer } from '@/lib/supabase-server';

export type TreadmillLicenseStatus = 'active' | 'suspended' | 'expired' | 'revoked';
export type TreadmillLicenseType = 'evaluation' | 'commercial' | 'dealer' | 'site' | 'development';

const LICENSE_TYPES = new Set<TreadmillLicenseType>([
  'evaluation',
  'commercial',
  'dealer',
  'site',
  'development',
]);

const LICENSE_STATUSES = new Set<TreadmillLicenseStatus>([
  'active',
  'suspended',
  'expired',
  'revoked',
]);

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomSegment(length = 4) {
  let output = '';
  const bytes = crypto.randomBytes(length * 2);
  for (let index = 0; output.length < length; index += 1) {
    output += CODE_ALPHABET[bytes[index] % CODE_ALPHABET.length];
  }
  return output;
}

export function normalizeCredential(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

export function hashCredential(value: string) {
  return crypto.createHash('sha256').update(normalizeCredential(value)).digest('hex');
}

export function generateLicenseKey(type: TreadmillLicenseType) {
  const prefix: Record<TreadmillLicenseType, string> = {
    evaluation: 'EVAL',
    commercial: 'COM',
    dealer: 'DLR',
    site: 'SITE',
    development: 'DEV',
  };
  return `FTC-${prefix[type]}-${randomSegment()}-${randomSegment()}-${randomSegment()}-${randomSegment()}`;
}

export function generateEngineeringCredential() {
  return `FDC-SVC-${randomSegment()}-${randomSegment()}-${randomSegment()}`;
}

function requireServer() {
  if (!supabaseServer) throw new Error('Secure Supabase server access is not configured.');
  return supabaseServer;
}

export function isLicenseType(value: unknown): value is TreadmillLicenseType {
  return typeof value === 'string' && LICENSE_TYPES.has(value as TreadmillLicenseType);
}

export function isLicenseStatus(value: unknown): value is TreadmillLicenseStatus {
  return typeof value === 'string' && LICENSE_STATUSES.has(value as TreadmillLicenseStatus);
}

function withEffectiveStatus<T extends { status: string; expires_at?: string | null }>(license: T): T {
  if (license.status === 'active' && license.expires_at && new Date(license.expires_at) <= new Date()) {
    return { ...license, status: 'expired' } as T;
  }
  return license;
}

export async function listTreadmillLicenses() {
  const db = requireServer();
  const { data, error } = await db
    .from('treadmill_licenses')
    .select('id, license_key_last4, customer_name, license_type, status, max_installations, valid_from, expires_at, revalidate_days, offline_grace_days, signing_key_id, brand_profile, modules, notes, created_at, updated_at, treadmill_license_activations(id, installation_id, hardware_device_id, status, first_activated_at, last_validated_at, last_seen_at, app_version)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((item) => withEffectiveStatus(item));
}

export async function getTreadmillLicense(id: string) {
  const db = requireServer();
  const [{ data: license, error: licenseError }, { data: events, error: eventsError }, { data: sessions, error: sessionsError }, { data: adminAudit, error: adminAuditError }] = await Promise.all([
    db
      .from('treadmill_licenses')
      .select('id, license_key_last4, customer_name, license_type, status, max_installations, valid_from, expires_at, revalidate_days, offline_grace_days, signing_key_id, brand_profile, modules, notes, created_at, updated_at, treadmill_license_activations(id, installation_id, hardware_device_id, status, first_activated_at, last_validated_at, last_seen_at, app_version, metadata)')
      .eq('id', id)
      .single(),
    db
      .from('treadmill_license_events')
      .select('id, activation_id, installation_id, event_type, success, details, created_at')
      .eq('license_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
    db
      .from('treadmill_engineering_sessions')
      .select('id, activation_id, installation_id, expires_at, revoked_at, created_at')
      .eq('license_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
    db
      .from('treadmill_admin_audit')
      .select('id, activation_id, actor, action, details, created_at')
      .eq('license_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
  ]);
  if (licenseError) throw licenseError;
  if (eventsError) throw eventsError;
  if (sessionsError) throw sessionsError;
  if (adminAuditError) throw adminAuditError;
  return {
    license: withEffectiveStatus(license),
    events: events || [],
    engineeringSessions: sessions || [],
    adminAudit: adminAudit || [],
  };
}

export async function createTreadmillLicense(input: {
  customerName: string;
  licenseType: TreadmillLicenseType;
  maxInstallations: number;
  expiresAt: string | null;
  revalidateDays: number;
  offlineGraceDays: number;
  brandProfile?: Record<string, unknown>;
  modules?: string[];
  notes?: string | null;
}) {
  const db = requireServer();
  const licenseKey = generateLicenseKey(input.licenseType);
  const engineeringCredential = generateEngineeringCredential();

  const { data, error } = await db
    .from('treadmill_licenses')
    .insert({
      license_key_hash: hashCredential(licenseKey),
      license_key_last4: licenseKey.slice(-4),
      customer_name: input.customerName,
      license_type: input.licenseType,
      status: 'active',
      max_installations: input.maxInstallations,
      expires_at: input.expiresAt,
      revalidate_days: input.revalidateDays,
      offline_grace_days: input.offlineGraceDays,
      engineering_code_hash: hashCredential(engineeringCredential),
      signing_key_id: 'ftc-license-v1',
      brand_profile: input.brandProfile || {},
      modules: input.modules || ['console', 'media', 'engineering', 'white_label'],
      notes: input.notes || null,
    })
    .select('id, license_key_last4, customer_name, license_type, status, max_installations, valid_from, expires_at, revalidate_days, offline_grace_days, brand_profile, modules, notes, created_at')
    .single();

  if (error) throw error;
  return { license: data, licenseKey, engineeringCredential };
}

export async function updateTreadmillLicense(
  id: string,
  patch: {
    customerName?: string;
    status?: TreadmillLicenseStatus;
    maxInstallations?: number;
    expiresAt?: string | null;
    revalidateDays?: number;
    offlineGraceDays?: number;
    brandProfile?: Record<string, unknown>;
    modules?: string[];
    notes?: string | null;
  },
) {
  const db = requireServer();
  const update: Record<string, unknown> = {};
  if (patch.customerName !== undefined) update.customer_name = patch.customerName;
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.maxInstallations !== undefined) update.max_installations = patch.maxInstallations;
  if (patch.expiresAt !== undefined) update.expires_at = patch.expiresAt;
  if (patch.revalidateDays !== undefined) update.revalidate_days = patch.revalidateDays;
  if (patch.offlineGraceDays !== undefined) update.offline_grace_days = patch.offlineGraceDays;
  if (patch.brandProfile !== undefined) update.brand_profile = patch.brandProfile;
  if (patch.modules !== undefined) update.modules = patch.modules;
  if (patch.notes !== undefined) update.notes = patch.notes;

  const { data, error } = await db
    .from('treadmill_licenses')
    .update(update)
    .eq('id', id)
    .select('id, license_key_last4, customer_name, license_type, status, max_installations, valid_from, expires_at, revalidate_days, offline_grace_days, brand_profile, modules, notes, updated_at')
    .single();
  if (error) throw error;
  return data;
}

export async function rotateEngineeringCredential(id: string) {
  const db = requireServer();
  const engineeringCredential = generateEngineeringCredential();
  const { error } = await db
    .from('treadmill_licenses')
    .update({ engineering_code_hash: hashCredential(engineeringCredential) })
    .eq('id', id);
  if (error) throw error;

  await db
    .from('treadmill_engineering_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('license_id', id)
    .is('revoked_at', null);

  return { engineeringCredential };
}

export async function revokeEngineeringSessions(id: string) {
  const db = requireServer();
  const { error } = await db
    .from('treadmill_engineering_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('license_id', id)
    .is('revoked_at', null);
  if (error) throw error;
}

export async function updateActivationStatus(
  licenseId: string,
  activationId: string,
  status: 'active' | 'deactivated' | 'revoked',
) {
  const db = requireServer();
  const { data, error } = await db
    .from('treadmill_license_activations')
    .update({ status, last_seen_at: new Date().toISOString() })
    .eq('id', activationId)
    .eq('license_id', licenseId)
    .select('id, installation_id, hardware_device_id, status, first_activated_at, last_validated_at, last_seen_at, app_version')
    .single();
  if (error) throw error;

  if (status !== 'active') {
    await db
      .from('treadmill_engineering_sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('activation_id', activationId)
      .is('revoked_at', null);
  }

  return data;
}

export async function recordTreadmillAdminAudit(input: {
  licenseId?: string | null;
  activationId?: string | null;
  action: string;
  details?: Record<string, unknown>;
}) {
  const db = requireServer();
  const { error } = await db.from('treadmill_admin_audit').insert({
    license_id: input.licenseId || null,
    activation_id: input.activationId || null,
    actor: 'admin',
    action: input.action,
    details: input.details || {},
  });
  if (error) throw error;
}

export async function treadmillLicenseStats() {
  const db = requireServer();
  const now = new Date().toISOString();
  const [licenses, activeLicenses, expiring, activations, failedAuth] = await Promise.all([
    db.from('treadmill_licenses').select('*', { count: 'exact', head: true }),
    db.from('treadmill_licenses').select('*', { count: 'exact', head: true }).eq('status', 'active').or('expires_at.is.null,expires_at.gt.' + now),
    db.from('treadmill_licenses').select('*', { count: 'exact', head: true }).eq('status', 'active').gte('expires_at', now).lte('expires_at', new Date(Date.now() + 30 * 86400000).toISOString()),
    db.from('treadmill_license_activations').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('treadmill_license_events').select('*', { count: 'exact', head: true }).eq('success', false).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const error = [licenses, activeLicenses, expiring, activations, failedAuth].find((result) => result.error)?.error;
  if (error) throw error;

  return {
    totalLicenses: licenses.count || 0,
    activeLicenses: activeLicenses.count || 0,
    expiringSoon: expiring.count || 0,
    activeInstallations: activations.count || 0,
    failedAuth24h: failedAuth.count || 0,
  };
}
