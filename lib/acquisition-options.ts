import type { AppRecord, CommercialMode } from '@/lib/apps';

export const buyerTypes = ['individual_entrepreneur', 'company', 'investor', 'software_agency', 'startup', 'institution', 'government_public_organization', 'ngo_nonprofit', 'other'] as const;
export const acquisitionTypes = ['full_application_acquisition', 'exclusive_commercial_license', 'non_exclusive_commercial_license', 'white_label_acquisition', 'strategic_partnership', 'custom_deployment', 'unsure_guidance'] as const;
export const transferChoices = ['yes', 'no', 'need_guidance'] as const;
export const completionRequirements = ['complete_before_handover', 'complete_to_requirements', 'acquire_current_state', 'technical_consultation'] as const;
export const supportRequirements = ['yes', 'no', 'possibly', 'need_support_options'] as const;
export const budgetRanges = ['under_5000', '5000_10000', '10000_25000', '25000_50000', '50000_plus', 'prefer_not_to_disclose'] as const;
export const acquisitionTimelines = ['immediately', 'within_30_days', '1_3_months', '3_6_months', 'exploring_options', 'flexible'] as const;
export const acquisitionStatuses = ['acquisition_initiated', 'under_review', 'buyer_qualification', 'awaiting_buyer_information', 'nda_required', 'nda_completed', 'private_demo_scheduled', 'technical_due_diligence', 'commercial_negotiation', 'agreement_preparation', 'agreement_pending_signature', 'payment_pending', 'development_completion', 'handover_preparation', 'acquisition_completed', 'declined', 'withdrawn', 'closed'] as const;

export type BuyerType = typeof buyerTypes[number];
export type AcquisitionType = typeof acquisitionTypes[number];
export type AcquisitionStatus = typeof acquisitionStatuses[number];

export const labels = {
  buyerType: { individual_entrepreneur: 'Individual Entrepreneur', company: 'Company', investor: 'Investor', software_agency: 'Software Agency', startup: 'Startup', institution: 'Institution', government_public_organization: 'Government / Public Organization', ngo_nonprofit: 'NGO / Nonprofit', other: 'Other' },
  acquisitionType: { full_application_acquisition: 'Full Application Acquisition', exclusive_commercial_license: 'Exclusive Commercial License', non_exclusive_commercial_license: 'Non-Exclusive Commercial License', white_label_acquisition: 'White-Label Acquisition', strategic_partnership: 'Strategic Partnership', custom_deployment: 'Custom Deployment', unsure_guidance: 'Unsure — Need Commercial Guidance' },
  transfer: { yes: 'Yes', no: 'No', need_guidance: 'Need Guidance' },
  completion: { complete_before_handover: 'Yes — Complete Before Handover', complete_to_requirements: 'Yes — Complete According to My Requirements', acquire_current_state: 'No — Acquire Current Development State', technical_consultation: 'Need Technical Consultation' },
  support: { yes: 'Yes', no: 'No', possibly: 'Possibly', need_support_options: 'Need Support Options' },
  budget: { under_5000: 'Under US$5,000', '5000_10000': 'US$5,000–US$10,000', '10000_25000': 'US$10,000–US$25,000', '25000_50000': 'US$25,000–US$50,000', '50000_plus': 'US$50,000+', prefer_not_to_disclose: 'Prefer Not to Disclose' },
  timeline: { immediately: 'Immediately', within_30_days: 'Within 30 Days', '1_3_months': '1–3 Months', '3_6_months': '3–6 Months', exploring_options: 'Exploring Options', flexible: 'Flexible' },
  status: { acquisition_initiated: 'Acquisition Initiated', under_review: 'Under Review', buyer_qualification: 'Buyer Qualification', awaiting_buyer_information: 'Awaiting Buyer Information', nda_required: 'NDA Required', nda_completed: 'NDA Completed', private_demo_scheduled: 'Private Demo Scheduled', technical_due_diligence: 'Technical Due Diligence', commercial_negotiation: 'Commercial Negotiation', agreement_preparation: 'Agreement Preparation', agreement_pending_signature: 'Agreement Pending Signature', payment_pending: 'Payment Pending', development_completion: 'Development Completion', handover_preparation: 'Handover Preparation', acquisition_completed: 'Acquisition Completed', declined: 'Declined', withdrawn: 'Withdrawn', closed: 'Closed' },
} as const;

const modeTypes: Partial<Record<CommercialMode, AcquisitionType[]>> = {
  exclusive_acquisition: ['full_application_acquisition'], full_acquisition: ['full_application_acquisition'],
  hosted_license: ['non_exclusive_commercial_license'], exclusive_license: ['exclusive_commercial_license'], non_exclusive_license: ['non_exclusive_commercial_license'],
  white_label: ['white_label_acquisition'], strategic_partnership: ['strategic_partnership'], custom_deployment: ['custom_deployment'],
};

export function allowedAcquisitionTypes(app: Pick<AppRecord, 'commercialModes'>) {
  const configured = app.commercialModes.flatMap((mode) => modeTypes[mode] || []);
  return Array.from(new Set([...configured, 'unsure_guidance' as const]));
}
