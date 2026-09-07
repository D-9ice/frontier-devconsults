import 'server-only';

import { randomBytes } from 'node:crypto';
import { acquisitionTimelines, acquisitionTypes, allowedAcquisitionTypes, budgetRanges, buyerTypes, completionRequirements, supportRequirements, transferChoices } from '@/lib/acquisition-options';
import type { AppRecord } from '@/lib/apps';

export type AcquisitionInput = {
  productSlug: string; idempotencyKey: string; fullName: string; company: string; email: string; phone?: string; country: string; website?: string; role?: string;
  buyerType: string; acquisitionType: string; intendedUse: string; deploymentMarket: string; sourceCodeTransfer: string; ipBrandingTransfer: string;
  completionRequirement: string; additionalDevelopmentRequirements?: string; supportRequirement: string; budgetRange?: string; acquisitionTimeline: string;
  additionalRequirements?: string; legalAcknowledged: boolean; privacyAcknowledged: boolean; websiteField?: string;
  attribution?: { utmSource?: string; utmMedium?: string; utmCampaign?: string; utmContent?: string; utmTerm?: string; referrer?: string; landingPage?: string };
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function text(value: unknown, max: number) { return typeof value === 'string' ? value.replace(/\0/g, '').trim().slice(0, max) : ''; }
function choice<T extends readonly string[]>(value: unknown, choices: T) { const clean = text(value, 100); return choices.includes(clean as T[number]) ? clean : ''; }
function optionalUrl(value: unknown) { const clean = text(value, 500); if (!clean) return ''; try { const url = new URL(clean); return ['http:', 'https:'].includes(url.protocol) ? url.toString() : ''; } catch { return ''; } }

export function validateAcquisitionInput(raw: unknown, app: AppRecord) {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const requiredText = (key: string, max: number, label: string) => { const value = text(input[key], max); if (!value) errors[key] = `${label} is required.`; return value; };
  const websiteInput = text(input.website, 500);
  const cleaned: AcquisitionInput = {
    productSlug: app.slug || '', idempotencyKey: text(input.idempotencyKey, 80), fullName: requiredText('fullName', 200, 'Full name'), company: requiredText('company', 240, 'Company or organization'),
    email: requiredText('email', 320, 'Email address').toLowerCase(), phone: text(input.phone, 80), country: requiredText('country', 120, 'Country'), website: optionalUrl(websiteInput), role: text(input.role, 160),
    buyerType: choice(input.buyerType, buyerTypes), acquisitionType: choice(input.acquisitionType, acquisitionTypes), intendedUse: requiredText('intendedUse', 5000, 'Intended use'), deploymentMarket: requiredText('deploymentMarket', 240, 'Deployment market'),
    sourceCodeTransfer: choice(input.sourceCodeTransfer, transferChoices), ipBrandingTransfer: choice(input.ipBrandingTransfer, transferChoices), completionRequirement: choice(input.completionRequirement, completionRequirements),
    additionalDevelopmentRequirements: text(input.additionalDevelopmentRequirements, 5000), supportRequirement: choice(input.supportRequirement, supportRequirements), budgetRange: choice(input.budgetRange, budgetRanges),
    acquisitionTimeline: choice(input.acquisitionTimeline, acquisitionTimelines), additionalRequirements: text(input.additionalRequirements, 5000), legalAcknowledged: input.legalAcknowledged === true, privacyAcknowledged: input.privacyAcknowledged === true,
    websiteField: text(input.websiteField, 200), attribution: typeof input.attribution === 'object' && input.attribution ? {
      utmSource: text((input.attribution as Record<string, unknown>).utmSource, 240), utmMedium: text((input.attribution as Record<string, unknown>).utmMedium, 240), utmCampaign: text((input.attribution as Record<string, unknown>).utmCampaign, 240),
      utmContent: text((input.attribution as Record<string, unknown>).utmContent, 240), utmTerm: text((input.attribution as Record<string, unknown>).utmTerm, 240), referrer: text((input.attribution as Record<string, unknown>).referrer, 1000), landingPage: text((input.attribution as Record<string, unknown>).landingPage, 1000),
    } : {},
  };
  if (!emailPattern.test(cleaned.email)) errors.email = 'Enter a valid email address.';
  if (websiteInput && !cleaned.website) errors.website = 'Enter a valid website beginning with http:// or https://.';
  if (!uuidPattern.test(cleaned.idempotencyKey)) errors.idempotencyKey = 'Please refresh the form and try again.';
  if (!cleaned.buyerType) errors.buyerType = 'Choose a buyer type.';
  if (!cleaned.acquisitionType || !allowedAcquisitionTypes(app).includes(cleaned.acquisitionType as never)) errors.acquisitionType = 'Choose an acquisition option available for this product.';
  if (!cleaned.sourceCodeTransfer) errors.sourceCodeTransfer = 'Choose a source-code option.';
  if (!cleaned.ipBrandingTransfer) errors.ipBrandingTransfer = 'Choose an intellectual-property option.';
  if (!cleaned.completionRequirement) errors.completionRequirement = 'Choose a development-completion option.';
  if (!cleaned.supportRequirement) errors.supportRequirement = 'Choose a support option.';
  if (!cleaned.acquisitionTimeline) errors.acquisitionTimeline = 'Choose an acquisition timeline.';
  if (!cleaned.legalAcknowledged) errors.legalAcknowledged = 'You must accept the legal acknowledgment.';
  if (!cleaned.privacyAcknowledged) errors.privacyAcknowledged = 'You must accept the privacy acknowledgment.';
  return { cleaned, errors, valid: Object.keys(errors).length === 0 };
}

export function acquisitionReference() { return `FDC-ACQ-${new Date().getUTCFullYear()}-${randomBytes(12).toString('hex').toUpperCase()}`; }
