import 'server-only';

import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';
import { listApps, type AppRecord } from '@/lib/apps';
import { isAcquisitionEnabled } from '@/lib/application-presentation';
import { listProjects, type Project } from '@/lib/projects';

export const ownershipTypes = ['frontier_product', 'client_project'] as const;
export const commercialStates = ['available_for_acquisition', 'available_for_licensing', 'available_for_customization', 'partnership_available', 'not_currently_available', 'not_for_sale'] as const;
export const evidenceStatuses = ['draft', 'pending_verification', 'verified', 'approved_for_publication', 'rejected', 'private'] as const;
export const evidenceTypes = ['screenshot', 'mobile_screenshot', 'desktop_screenshot', 'dashboard_screenshot', 'architecture_diagram', 'project_video', 'testimonial', 'performance_measurement', 'usage_traffic', 'launch_deployment_date', 'business_result', 'technical_validation', 'supporting_document', 'external_project_link', 'other'] as const;
export const defaultSectionOrder = ['overview', 'problem', 'objectives', 'challenges', 'approach', 'architecture', 'decisions', 'capabilities', 'solutions', 'security', 'performance', 'ux', 'technology', 'gallery', 'results', 'status', 'insights'];

export type OwnershipType = typeof ownershipTypes[number];
export type CommercialState = typeof commercialStates[number];
export type EvidenceStatus = typeof evidenceStatuses[number];
export type EvidenceType = typeof evidenceTypes[number];
export type CaseStudySourceType = 'project' | 'app';

export type CaseStudyEvidence = {
  id: string;
  title: string;
  description: string;
  type: EvidenceType;
  sourceUrl: string | null;
  date: string | null;
  status: EvidenceStatus;
  attribution: string | null;
  clientAttribution: string | null;
  externalUrl: string | null;
  clientName?: string | null;
  clientCompany?: string | null;
  clientRole?: string | null;
  testimonialText?: string | null;
  testimonialDate?: string | null;
  publicationPermission: boolean;
  verificationState: 'unverified' | 'verified';
};

export type EngineeringDecision = { decision: string; reason: string; benefit: string };
export type ProblemSolution = { challenge: string; response: string; outcome: string };
export type CaseStudyArchitecture = { narrative?: string; diagramUrl?: string; frontend?: string; backend?: string; database?: string; infrastructure?: string; services?: string; integrations?: string };

export type CaseStudy = {
  id: string;
  projectId: string | null;
  appId: string | null;
  sourceType: CaseStudySourceType;
  source: Project | AppRecord;
  slug: string;
  ownershipType: OwnershipType;
  commercialState: CommercialState;
  clientCommercialAuthorized: boolean;
  visibility: 'draft' | 'published';
  executiveSummary: string;
  intendedMarket: string;
  engineeringResponsibility: string;
  problemOpportunity: string;
  objectives: string[];
  challengesConstraints: string[];
  engineeringApproach: string;
  architecture: CaseStudyArchitecture;
  engineeringDecisions: EngineeringDecision[];
  capabilities: string[];
  problemsSolutions: ProblemSolution[];
  securityReliability: string[];
  performanceScalability: string;
  userExperience: string;
  technologyArchitecture: Record<string, string[]>;
  projectStatus: string;
  engineeringInsights: string;
  evidence: CaseStudyEvidence[];
  sectionOrder: string[];
  seoTitle: string;
  seoDescription: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CaseStudyInput = Omit<CaseStudy, 'id' | 'source' | 'sourceType' | 'publishedAt' | 'createdAt' | 'updatedAt'>;

function client() {
  if (!isSupabaseServerConfigured() || !supabaseServer) throw new Error('Secure Supabase server access is not configured.');
  return supabaseServer;
}

function strings(value: unknown) { return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []; }
function object(value: unknown) { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function text(value: unknown) { return typeof value === 'string' ? value : ''; }
function optionalText(value: unknown) { return typeof value === 'string' && value.trim() ? value : null; }

function mapEvidence(value: unknown): CaseStudyEvidence[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const row = object(item);
    if (!evidenceTypes.includes(row.type as EvidenceType) || !evidenceStatuses.includes(row.status as EvidenceStatus)) return [];
    return [{
      id: text(row.id), title: text(row.title), description: text(row.description), type: row.type as EvidenceType,
      sourceUrl: optionalText(row.sourceUrl), date: optionalText(row.date), status: row.status as EvidenceStatus,
      attribution: optionalText(row.attribution), clientAttribution: optionalText(row.clientAttribution), externalUrl: optionalText(row.externalUrl),
      clientName: optionalText(row.clientName), clientCompany: optionalText(row.clientCompany), clientRole: optionalText(row.clientRole),
      testimonialText: optionalText(row.testimonialText), testimonialDate: optionalText(row.testimonialDate),
      publicationPermission: row.publicationPermission === true, verificationState: row.verificationState === 'verified' ? 'verified' : 'unverified',
    }];
  });
}

export function filterPublicEvidence(items: CaseStudyEvidence[]) {
  return items.filter((item) => item.status === 'approved_for_publication'
    && (item.type !== 'testimonial' || (item.publicationPermission && item.verificationState === 'verified' && Boolean(item.testimonialText))));
}

function mapRow(row: Record<string, unknown>, source: Project | AppRecord): CaseStudy {
  const sourceType: CaseStudySourceType = row.project_id ? 'project' : 'app';
  const technology = object(row.technology_architecture);
  return {
    id: String(row.id), projectId: optionalText(row.project_id), appId: optionalText(row.app_id), sourceType, source,
    slug: text(row.slug), ownershipType: ownershipTypes.includes(row.ownership_type as OwnershipType) ? row.ownership_type as OwnershipType : 'client_project',
    commercialState: commercialStates.includes(row.commercial_state as CommercialState) ? row.commercial_state as CommercialState : 'not_for_sale',
    clientCommercialAuthorized: row.client_commercial_authorized === true, visibility: row.visibility === 'published' ? 'published' : 'draft',
    executiveSummary: text(row.executive_summary), intendedMarket: text(row.intended_market), engineeringResponsibility: text(row.engineering_responsibility),
    problemOpportunity: text(row.problem_opportunity), objectives: strings(row.objectives), challengesConstraints: strings(row.challenges_constraints),
    engineeringApproach: text(row.engineering_approach), architecture: object(row.architecture) as CaseStudyArchitecture,
    engineeringDecisions: Array.isArray(row.engineering_decisions) ? row.engineering_decisions.map(object).map((item) => ({ decision: text(item.decision), reason: text(item.reason), benefit: text(item.benefit) })).filter((item) => item.decision) : [],
    capabilities: strings(row.capabilities),
    problemsSolutions: Array.isArray(row.problems_solutions) ? row.problems_solutions.map(object).map((item) => ({ challenge: text(item.challenge), response: text(item.response), outcome: text(item.outcome) })).filter((item) => item.challenge) : [],
    securityReliability: strings(row.security_reliability), performanceScalability: text(row.performance_scalability), userExperience: text(row.user_experience),
    technologyArchitecture: Object.fromEntries(Object.entries(technology).filter(([, items]) => Array.isArray(items)).map(([key, items]) => [key, strings(items)])),
    projectStatus: text(row.project_status), engineeringInsights: text(row.engineering_insights), evidence: mapEvidence(row.evidence),
    sectionOrder: strings(row.section_order).length ? strings(row.section_order) : defaultSectionOrder,
    seoTitle: text(row.seo_title), seoDescription: text(row.seo_description), publishedAt: optionalText(row.published_at),
    createdAt: text(row.created_at), updatedAt: text(row.updated_at),
  };
}

function row(input: CaseStudyInput) {
  return {
    project_id: input.projectId, app_id: input.appId, slug: input.slug.trim().toLowerCase(), ownership_type: input.ownershipType,
    commercial_state: input.ownershipType === 'client_project' && !input.clientCommercialAuthorized ? 'not_for_sale' : input.commercialState,
    client_commercial_authorized: input.clientCommercialAuthorized, visibility: input.visibility,
    executive_summary: input.executiveSummary.trim(), intended_market: optionalText(input.intendedMarket), engineering_responsibility: optionalText(input.engineeringResponsibility),
    problem_opportunity: optionalText(input.problemOpportunity), objectives: input.objectives, challenges_constraints: input.challengesConstraints,
    engineering_approach: optionalText(input.engineeringApproach), architecture: input.architecture, engineering_decisions: input.engineeringDecisions,
    capabilities: input.capabilities, problems_solutions: input.problemsSolutions, security_reliability: input.securityReliability,
    performance_scalability: optionalText(input.performanceScalability), user_experience: optionalText(input.userExperience), technology_architecture: input.technologyArchitecture,
    project_status: optionalText(input.projectStatus), engineering_insights: optionalText(input.engineeringInsights), evidence: input.evidence,
    section_order: input.sectionOrder, seo_title: optionalText(input.seoTitle), seo_description: optionalText(input.seoDescription),
    published_at: input.visibility === 'published' ? new Date().toISOString() : null, updated_at: new Date().toISOString(),
  };
}

function safeUrl(value: string | null | undefined) {
  if (!value) return true;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}

export function validateCaseStudy(input: Partial<CaseStudyInput>) {
  if ((!input.projectId && !input.appId) || (input.projectId && input.appId)) return 'Choose exactly one existing project or product.';
  if (!input.slug?.trim() || !/^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/.test(input.slug.trim())) return 'Use a lowercase, hyphenated case-study slug.';
  if (!ownershipTypes.includes(input.ownershipType as OwnershipType)) return 'Choose a valid ownership type.';
  if (!commercialStates.includes(input.commercialState as CommercialState)) return 'Choose a valid commercial state.';
  if (input.ownershipType === 'client_project' && !input.clientCommercialAuthorized && input.commercialState !== 'not_for_sale') return 'Client projects require explicit authorization before any commercial availability can be selected.';
  if (!['draft', 'published'].includes(input.visibility || '')) return 'Choose a valid publication state.';
  if (!input.executiveSummary?.trim()) return 'An executive summary is required.';
  if ((input.executiveSummary?.length || 0) > 12_000 || (input.seoTitle?.length || 0) > 160 || (input.seoDescription?.length || 0) > 320) return 'Case-study text exceeds its allowed length.';
  if (!safeUrl(input.architecture?.diagramUrl)) return 'The architecture diagram link must use http or https.';
  if ((input.sectionOrder?.length || 0) !== new Set(input.sectionOrder || []).size || (input.sectionOrder || []).some((key) => !defaultSectionOrder.includes(key))) return 'Section order contains an unknown or duplicate section.';
  const lists = [input.objectives, input.challengesConstraints, input.capabilities, input.securityReliability, input.engineeringDecisions, input.problemsSolutions, input.evidence];
  if (lists.some((items) => (items?.length || 0) > 80)) return 'A case-study list contains too many entries.';
  for (const item of input.evidence || []) {
    if (!item.id || !item.title?.trim() || !evidenceTypes.includes(item.type) || !evidenceStatuses.includes(item.status)) return 'Every evidence record needs a title, type, and valid status.';
    if (!safeUrl(item.sourceUrl) || !safeUrl(item.externalUrl)) return 'Evidence links must use http or https.';
    if (item.status === 'approved_for_publication' && item.type === 'testimonial' && (!item.publicationPermission || item.verificationState !== 'verified' || !item.testimonialText?.trim())) return 'A testimonial requires supplied text, verification, and publication permission before approval.';
  }
  return null;
}

async function sources(includeDrafts = true) {
  const [projects, apps] = await Promise.all([listProjects(includeDrafts), listApps(includeDrafts)]);
  return { projects, apps };
}

export async function listCaseStudies(includeDrafts = true) {
  let query = client().from('case_studies').select('*').order('updated_at', { ascending: false });
  if (!includeDrafts) query = query.eq('visibility', 'published');
  const [{ data, error }, available] = await Promise.all([query, sources(includeDrafts)]);
  if (error) throw error;
  const projects = new Map(available.projects.map((item) => [item.id, item]));
  const apps = new Map(available.apps.map((item) => [item.id, item]));
  return (data || []).flatMap((item) => {
    const source = item.project_id ? projects.get(String(item.project_id)) : apps.get(String(item.app_id));
    if (!source) return [];
    const mapped = mapRow(item, source);
    return [{ ...mapped, evidence: includeDrafts ? mapped.evidence : filterPublicEvidence(mapped.evidence) }];
  });
}

export async function getPublicCaseStudyBySlug(slug: string) {
  const item = (await listCaseStudies(false)).find((caseStudy) => caseStudy.slug === slug);
  if (!item) return null;
  return { ...item, evidence: filterPublicEvidence(item.evidence) };
}

export function caseStudyAcquisitionEnabled(item: CaseStudy) {
  if (item.sourceType !== 'app') return false;
  if (item.ownershipType === 'client_project' && !item.clientCommercialAuthorized) return false;
  if (['not_for_sale', 'not_currently_available'].includes(item.commercialState)) return false;
  return isAcquisitionEnabled(item.source as AppRecord);
}

export async function createCaseStudy(input: CaseStudyInput) {
  const { data, error } = await client().from('case_studies').insert(row(input)).select('*').single();
  if (error) throw error;
  const available = await sources();
  const source = data.project_id ? available.projects.find((item) => item.id === data.project_id) : available.apps.find((item) => item.id === data.app_id);
  if (!source) throw new Error('Case-study source was not found.');
  return mapRow(data, source);
}

export async function updateCaseStudy(id: string, input: CaseStudyInput) {
  const { data, error } = await client().from('case_studies').update(row(input)).eq('id', id).select('*').single();
  if (error) throw error;
  const available = await sources();
  const source = data.project_id ? available.projects.find((item) => item.id === data.project_id) : available.apps.find((item) => item.id === data.app_id);
  if (!source) throw new Error('Case-study source was not found.');
  return mapRow(data, source);
}
