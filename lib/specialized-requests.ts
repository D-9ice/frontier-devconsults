import 'server-only';

import { randomBytes } from 'node:crypto';
import {
  connectivityRequirementOptions, controlRequirementOptions, currentSystemStates,
  developmentScopeOptions, interfaceRequirementOptions, monitoringRequirementOptions,
  specializedBudgetChoices, specializedProjectTypes, specializedTimelines,
} from '@/lib/specialized-options';

export type SpecializedRequestInput = {
  idempotencyKey: string;
  fullName: string;
  email: string;
  country: string;
  company?: string;
  phone?: string;
  website?: string;
  jobTitle?: string;
  projectTypes: string[];
  currentSystemState: string[];
  projectDescription: string;
  equipmentType?: string;
  operatingVoltage?: string;
  powerLevel?: string;
  motorType?: string;
  batteryType?: string;
  existingController?: string;
  existingCommunicationInterface?: string;
  sensorCount?: string;
  deviceCount?: string;
  environment?: string;
  controlRequirements: string[];
  monitoringRequirements: string[];
  interfaceRequirements: string[];
  connectivityRequirements: string[];
  developmentScope: string[];
  timeline?: string;
  budgetRange?: string;
  additionalInformation?: string;
  privacyAcknowledged: boolean;
  websiteField?: string;
  attribution: { utmSource?: string; utmMedium?: string; utmCampaign?: string; utmContent?: string; utmTerm?: string; referrer?: string; landingPage?: string };
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const text = (value: unknown, max: number) => typeof value === 'string' ? value.replace(/\0/g, '').trim().slice(0, max) : '';
const list = <T extends readonly string[]>(value: unknown, options: T, max = 20) => Array.isArray(value)
  ? [...new Set(value.map((item) => text(item, 100)).filter((item) => options.includes(item as T[number])))].slice(0, max)
  : [];
const choice = <T extends readonly string[]>(value: unknown, options: T) => { const clean = text(value, 100); return options.includes(clean as T[number]) ? clean : ''; };
const optionalUrl = (value: unknown) => { const clean = text(value, 500); if (!clean) return ''; try { const url = new URL(clean); return ['http:', 'https:'].includes(url.protocol) ? url.toString() : ''; } catch { return ''; } };

export function validateSpecializedRequest(raw: unknown) {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const required = (key: string, max: number, label: string) => { const value = text(input[key], max); if (!value) errors[key] = `${label} is required.`; return value; };
  const websiteInput = text(input.website, 500);
  const attribution = input.attribution && typeof input.attribution === 'object' ? input.attribution as Record<string, unknown> : {};
  const cleaned: SpecializedRequestInput = {
    idempotencyKey: text(input.idempotencyKey, 80), fullName: required('fullName', 200, 'Full name'), email: required('email', 320, 'Email address').toLowerCase(), country: required('country', 120, 'Country'),
    company: text(input.company, 240), phone: text(input.phone, 80), website: optionalUrl(websiteInput), jobTitle: text(input.jobTitle, 160),
    projectTypes: list(input.projectTypes, specializedProjectTypes), currentSystemState: list(input.currentSystemState, currentSystemStates), projectDescription: required('projectDescription', 8000, 'Project description'),
    equipmentType: text(input.equipmentType, 240), operatingVoltage: text(input.operatingVoltage, 120), powerLevel: text(input.powerLevel, 120), motorType: text(input.motorType, 160), batteryType: text(input.batteryType, 160), existingController: text(input.existingController, 240), existingCommunicationInterface: text(input.existingCommunicationInterface, 240), sensorCount: text(input.sensorCount, 80), deviceCount: text(input.deviceCount, 80), environment: text(input.environment, 500),
    controlRequirements: list(input.controlRequirements, controlRequirementOptions), monitoringRequirements: list(input.monitoringRequirements, monitoringRequirementOptions), interfaceRequirements: list(input.interfaceRequirements, interfaceRequirementOptions), connectivityRequirements: list(input.connectivityRequirements, connectivityRequirementOptions), developmentScope: list(input.developmentScope, developmentScopeOptions),
    timeline: choice(input.timeline, specializedTimelines), budgetRange: choice(input.budgetRange, specializedBudgetChoices), additionalInformation: text(input.additionalInformation, 8000), privacyAcknowledged: input.privacyAcknowledged === true, websiteField: text(input.websiteField, 200),
    attribution: { utmSource: text(attribution.utmSource, 240), utmMedium: text(attribution.utmMedium, 240), utmCampaign: text(attribution.utmCampaign, 240), utmContent: text(attribution.utmContent, 240), utmTerm: text(attribution.utmTerm, 240), referrer: text(attribution.referrer, 1000), landingPage: text(attribution.landingPage, 1000) },
  };
  if (!emailPattern.test(cleaned.email)) errors.email = 'Enter a valid email address.';
  if (websiteInput && !cleaned.website) errors.website = 'Enter a valid website beginning with http:// or https://.';
  if (!uuidPattern.test(cleaned.idempotencyKey)) errors.idempotencyKey = 'Please refresh the form and try again.';
  if (!cleaned.projectTypes.length) errors.projectTypes = 'Choose at least one project type.';
  if (!cleaned.privacyAcknowledged) errors.privacyAcknowledged = 'You must acknowledge the privacy notice.';
  return { cleaned, errors, valid: Object.keys(errors).length === 0 };
}

export function specializedRequestReference() {
  return `FDC-SPEC-${new Date().getUTCFullYear()}-${randomBytes(12).toString('hex').toUpperCase()}`;
}
