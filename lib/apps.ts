import 'server-only';

import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';
import { legacyStatus, lifecycles, normalizeLifecycle, type Lifecycle } from '@/lib/application-lifecycle';

export { lifecycles, normalizeLifecycle, type Lifecycle } from '@/lib/application-lifecycle';
export type AppVisibility = 'draft' | 'published';
export const solutionKinds = ['mobile_application', 'web_application', 'website', 'ai_platform', 'engineering_solution', 'engineering_service', 'client_project', 'other'] as const;
export const availabilities = ['available', 'coming_soon', 'by_enquiry', 'unavailable'] as const;
export const primaryActions = ['automatic', 'download', 'visit_live', 'view_details', 'request_demo', 'request_quote', 'join_waitlist', 'none'] as const;
export const commercialModes = ['hosted_license', 'white_label', 'exclusive_acquisition', 'full_acquisition', 'exclusive_license', 'non_exclusive_license', 'strategic_partnership', 'custom_completion', 'custom_deployment', 'private_demo'] as const;
export const developmentStatuses = ['concept_research', 'early_development', 'in_development', 'acquisition_preview', 'beta_pre_launch', 'production_ready', 'live', 'maintenance_expansion'] as const;
export type SolutionKind = typeof solutionKinds[number];
export type Availability = typeof availabilities[number];
export type PrimaryAction = typeof primaryActions[number];
export type CommercialMode = typeof commercialModes[number];
export type DevelopmentStatus = typeof developmentStatuses[number];

export type AppRecord = {
  id: string;
  name: string;
  slug: string | null;
  category: string;
  version: string;
  size: string | null;
  rating: number | null;
  downloads: string | null;
  description: string;
  features: string[];
  requirements: string[];
  iconUrl: string | null;
  screenshotUrls: string[];
  videoUrl: string | null;
  playStoreLink: string | null;
  downloadLink: string | null;
  lifecycle: Lifecycle;
  visibility: AppVisibility;
  featured: boolean;
  sortOrder: number;
  solutionKind: SolutionKind;
  availability: Availability;
  primaryAction: PrimaryAction;
  showInProjects: boolean;
  showInUpworkPortfolio: boolean;
  showInProducts: boolean;
  commercialModes: CommercialMode[];
  tagline: string | null;
  shortDescription: string | null;
  developmentStatus: DevelopmentStatus | null;
  completionPercentage: number | null;
  roadmapItems: string[];
  technologyStack: Record<string, string[]>;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  startingPriceUsdMinor: number | null;
  priceVisibility: 'show' | 'from' | 'enquire';
  demoUrl: string | null;
  technologies: string[];
  clientProblem: string | null;
  solutionSummary: string | null;
  responsibilities: string[];
  challenges: string[];
  outcomes: Array<{ label: string; value: string; evidenceNote?: string }>;
  confidentialityNote: string | null;
  deploymentOptions: string[];
  supportSummary: string | null;
  customizationAvailable: boolean;
  licenseTermsUrl: string | null;
  externalUrlVerifiedAt: string | null;
  thumbnailUrl: string | null;
  upworkSkillTags: string[];
  upworkRelevance: string | null;
  artifactVersion: string | null;
  artifactBuild: number | null;
  artifactFilename: string | null;
  artifactPlatform: string | null;
  artifactByteSize: number | null;
  artifactReleaseDate: string | null;
  artifactChecksum: string | null;
  artifactVerifiedAt: string | null;
  artifactAvailability: 'available' | 'temporarily_unavailable' | 'unavailable';
  updatedAt: string;
};

export type AppInput = Omit<AppRecord, 'id' | 'updatedAt'>;

function ensureServer() {
  if (!isSupabaseServerConfigured() || !supabaseServer) throw new Error('Secure Supabase server access is not configured.');
  return supabaseServer;
}

function mapApp(row: Record<string, unknown>): AppRecord {
  return {
    id: String(row.id), name: String(row.name), slug: typeof row.slug === 'string' ? row.slug : null,
    category: String(row.category), version: String(row.version), size: typeof row.size === 'string' ? row.size : null,
    rating: typeof row.rating === 'number' ? row.rating : Number.isFinite(Number(row.rating)) ? Number(row.rating) : null,
    downloads: typeof row.downloads === 'string' ? row.downloads : null, description: String(row.description),
    features: Array.isArray(row.features) ? row.features.map(String) : [], requirements: Array.isArray(row.requirements) ? row.requirements.map(String) : [],
    iconUrl: typeof row.icon_url === 'string' ? row.icon_url : null, screenshotUrls: Array.isArray(row.screenshot_urls) ? row.screenshot_urls.map(String) : [],
    videoUrl: typeof row.video_url === 'string' ? row.video_url : null, playStoreLink: typeof row.play_store_link === 'string' ? row.play_store_link : null,
    downloadLink: typeof row.download_link === 'string' ? row.download_link : null, lifecycle: normalizeLifecycle(row.lifecycle || row.status),
    visibility: row.visibility === 'published' ? 'published' : 'draft', featured: Boolean(row.featured), sortOrder: Number(row.sort_order || 0),
    solutionKind: solutionKinds.includes(row.solution_kind as SolutionKind) ? row.solution_kind as SolutionKind : 'other',
    availability: availabilities.includes(row.availability as Availability) ? row.availability as Availability : 'by_enquiry',
    primaryAction: primaryActions.includes(row.primary_action as PrimaryAction) ? row.primary_action as PrimaryAction : 'automatic',
    showInProjects: Boolean(row.show_in_projects), showInUpworkPortfolio: Boolean(row.show_in_upwork_portfolio), showInProducts: Boolean(row.show_in_products),
    commercialModes: Array.isArray(row.commercial_modes) ? row.commercial_modes.filter((mode): mode is CommercialMode => commercialModes.includes(mode as CommercialMode)) : [],
    tagline: typeof row.tagline === 'string' ? row.tagline : null,
    shortDescription: typeof row.short_description === 'string' ? row.short_description : null,
    developmentStatus: developmentStatuses.includes(row.development_status as DevelopmentStatus) ? row.development_status as DevelopmentStatus : null,
    completionPercentage: Number.isInteger(Number(row.completion_percentage)) && Number(row.completion_percentage) >= 0 && Number(row.completion_percentage) <= 100 ? Number(row.completion_percentage) : null,
    roadmapItems: Array.isArray(row.roadmap_items) ? row.roadmap_items.map(String) : [],
    technologyStack: row.technology_stack && typeof row.technology_stack === 'object' && !Array.isArray(row.technology_stack) ? Object.fromEntries(Object.entries(row.technology_stack as Record<string, unknown>).filter(([, value]) => Array.isArray(value)).map(([key, value]) => [key, (value as unknown[]).map(String)])) : {},
    seoTitle: typeof row.seo_title === 'string' ? row.seo_title : null,
    seoDescription: typeof row.seo_description === 'string' ? row.seo_description : null,
    ogImageUrl: typeof row.og_image_url === 'string' ? row.og_image_url : null,
    startingPriceUsdMinor: Number.isSafeInteger(Number(row.starting_price_usd_minor)) && Number(row.starting_price_usd_minor) >= 0 ? Number(row.starting_price_usd_minor) : null,
    priceVisibility: ['show', 'from', 'enquire'].includes(String(row.price_visibility)) ? row.price_visibility as AppRecord['priceVisibility'] : 'enquire',
    demoUrl: typeof row.demo_url === 'string' ? row.demo_url : null,
    technologies: Array.isArray(row.technologies) ? row.technologies.map(String) : [], clientProblem: typeof row.client_problem === 'string' ? row.client_problem : null,
    solutionSummary: typeof row.solution_summary === 'string' ? row.solution_summary : null, responsibilities: Array.isArray(row.responsibilities) ? row.responsibilities.map(String) : [],
    challenges: Array.isArray(row.challenges) ? row.challenges.map(String) : [], outcomes: Array.isArray(row.outcomes) ? row.outcomes.filter((item): item is AppRecord['outcomes'][number] => Boolean(item && typeof item === 'object' && 'label' in item && 'value' in item)) : [],
    confidentialityNote: typeof row.confidentiality_note === 'string' ? row.confidentiality_note : null, deploymentOptions: Array.isArray(row.deployment_options) ? row.deployment_options.map(String) : [],
    supportSummary: typeof row.support_summary === 'string' ? row.support_summary : null, customizationAvailable: Boolean(row.customization_available), licenseTermsUrl: typeof row.license_terms_url === 'string' ? row.license_terms_url : null,
    externalUrlVerifiedAt: typeof row.external_url_verified_at === 'string' ? row.external_url_verified_at : null,
    thumbnailUrl: typeof row.thumbnail_url === 'string' ? row.thumbnail_url : null,
    upworkSkillTags: Array.isArray(row.upwork_skill_tags) ? row.upwork_skill_tags.map(String) : [],
    upworkRelevance: typeof row.upwork_relevance === 'string' ? row.upwork_relevance : null,
    artifactVersion: typeof row.artifact_version === 'string' ? row.artifact_version : null,
    artifactBuild: Number.isSafeInteger(Number(row.artifact_build)) && Number(row.artifact_build) > 0 ? Number(row.artifact_build) : null,
    artifactFilename: typeof row.artifact_filename === 'string' ? row.artifact_filename : null,
    artifactPlatform: typeof row.artifact_platform === 'string' ? row.artifact_platform : null,
    artifactByteSize: Number.isSafeInteger(Number(row.artifact_byte_size)) && Number(row.artifact_byte_size) > 0 ? Number(row.artifact_byte_size) : null,
    artifactReleaseDate: typeof row.artifact_release_date === 'string' ? row.artifact_release_date : null,
    artifactChecksum: typeof row.artifact_checksum === 'string' ? row.artifact_checksum : null,
    artifactVerifiedAt: typeof row.artifact_verified_at === 'string' ? row.artifact_verified_at : null,
    artifactAvailability: ['available', 'temporarily_unavailable', 'unavailable'].includes(String(row.artifact_availability)) ? row.artifact_availability as AppRecord['artifactAvailability'] : 'temporarily_unavailable',
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : new Date(0).toISOString(),
  };
}

function row(input: AppInput) {
  return {
    name: input.name.trim(), slug: input.slug?.trim() || null, category: input.category.trim(), version: input.version.trim(), size: input.size?.trim() || null,
    rating: input.rating, downloads: input.downloads?.trim() || null, description: input.description.trim(), features: input.features, requirements: input.requirements,
    icon_url: input.iconUrl?.trim() || null, screenshot_urls: input.screenshotUrls, video_url: input.videoUrl?.trim() || null,
    play_store_link: input.playStoreLink?.trim() || null, download_link: input.downloadLink?.trim() || null, lifecycle: input.lifecycle, status: legacyStatus(input.lifecycle),
    visibility: input.visibility, featured: input.featured, sort_order: input.sortOrder,
    solution_kind: input.solutionKind || 'other', availability: input.availability || 'by_enquiry', primary_action: input.primaryAction || 'automatic',
    show_in_projects: input.showInProjects || false, show_in_upwork_portfolio: input.showInUpworkPortfolio || false, show_in_products: input.showInProducts || false,
    commercial_modes: input.commercialModes || [], starting_price_usd_minor: input.startingPriceUsdMinor ?? null, price_visibility: input.priceVisibility || 'enquire',
    tagline: input.tagline?.trim() || null, short_description: input.shortDescription?.trim() || null,
    development_status: input.developmentStatus || null, completion_percentage: input.completionPercentage ?? null,
    roadmap_items: input.roadmapItems || [], technology_stack: input.technologyStack || {},
    seo_title: input.seoTitle?.trim() || null, seo_description: input.seoDescription?.trim() || null, og_image_url: input.ogImageUrl?.trim() || null,
    demo_url: input.demoUrl?.trim() || null, technologies: input.technologies || [], client_problem: input.clientProblem?.trim() || null,
    solution_summary: input.solutionSummary?.trim() || null, responsibilities: input.responsibilities || [], challenges: input.challenges || [], outcomes: input.outcomes || [],
    confidentiality_note: input.confidentialityNote?.trim() || null, deployment_options: input.deploymentOptions || [], support_summary: input.supportSummary?.trim() || null,
    customization_available: input.customizationAvailable || false, license_terms_url: input.licenseTermsUrl?.trim() || null,
    external_url_verified_at: input.externalUrlVerifiedAt || null, thumbnail_url: input.thumbnailUrl?.trim() || null,
    upwork_skill_tags: input.upworkSkillTags || [], upwork_relevance: input.upworkRelevance?.trim() || null,
    artifact_version: input.artifactVersion?.trim() || null, artifact_build: input.artifactBuild ?? null,
    artifact_filename: input.artifactFilename?.trim() || null, artifact_platform: input.artifactPlatform?.trim() || null,
    artifact_byte_size: input.artifactByteSize ?? null, artifact_release_date: input.artifactReleaseDate || null,
    artifact_checksum: input.artifactChecksum?.trim() || null, artifact_verified_at: input.artifactVerifiedAt || null,
    artifact_availability: input.artifactAvailability || 'temporarily_unavailable',
    published_at: input.visibility === 'published' ? new Date().toISOString() : null, updated_at: new Date().toISOString(),
  };
}

export function validateApp(input: Partial<AppInput>) {
  if (!input.name?.trim() || !input.category?.trim() || !input.version?.trim() || !input.description?.trim()) return 'Name, category, version, and description are required.';
  if (!lifecycles.includes(input.lifecycle as Lifecycle)) return 'Choose a valid lifecycle.';
  if (!['draft', 'published'].includes(input.visibility as string)) return 'Choose a valid visibility.';
  if (typeof input.sortOrder !== 'number' || !Number.isInteger(input.sortOrder) || input.sortOrder < 0) return 'Sort order must be a non-negative whole number.';
  if (input.rating !== null && input.rating !== undefined && (!Number.isFinite(input.rating) || input.rating < 0 || input.rating > 5)) return 'Rating must be between 0 and 5.';
  if (input.solutionKind !== undefined && !solutionKinds.includes(input.solutionKind as SolutionKind)) return 'Choose a valid solution kind.';
  if (input.availability !== undefined && !availabilities.includes(input.availability as Availability)) return 'Choose a valid availability.';
  if (input.primaryAction !== undefined && !primaryActions.includes(input.primaryAction as PrimaryAction)) return 'Choose a valid primary action.';
  if (input.priceVisibility !== undefined && !['show', 'from', 'enquire'].includes(input.priceVisibility as string)) return 'Choose a valid price visibility.';
  if (input.developmentStatus !== null && input.developmentStatus !== undefined && !developmentStatuses.includes(input.developmentStatus as DevelopmentStatus)) return 'Choose a valid development status.';
  if (input.completionPercentage !== null && input.completionPercentage !== undefined && (!Number.isInteger(input.completionPercentage) || input.completionPercentage < 0 || input.completionPercentage > 100)) return 'Engineering progress must be a whole number from 0 to 100.';
  if (input.commercialModes && input.commercialModes.some((mode) => !commercialModes.includes(mode as CommercialMode))) return 'Choose valid commercial options.';
  if (input.technologyStack && Object.entries(input.technologyStack).some(([key, values]) => !key.trim() || !Array.isArray(values) || values.some((value) => typeof value !== 'string'))) return 'Technology stack groups must contain text values.';
  if (input.startingPriceUsdMinor !== null && input.startingPriceUsdMinor !== undefined && (!Number.isSafeInteger(input.startingPriceUsdMinor) || input.startingPriceUsdMinor < 0)) return 'Starting price must be a non-negative USD minor-unit amount.';
  const urls = [
    ['App icon URL', input.iconUrl],
    ['Video URL', input.videoUrl],
    ['Play Store URL', input.playStoreLink],
    ['Direct download URL', input.downloadLink],
    ['Demo URL', input.demoUrl],
    ['License terms URL', input.licenseTermsUrl],
    ['Open Graph image URL', input.ogImageUrl],
    ...((input.screenshotUrls || []).map((url) => ['Screenshot URL', url] as const)),
  ];
  for (const [label, value] of urls) {
    if (!value?.trim()) continue;
    try {
      const parsed = new URL(value);
      if (!['http:', 'https:'].includes(parsed.protocol)) return `${label} must use http or https.`;
    } catch {
      return `${label} must be a valid URL.`;
    }
  }
  if (input.featured && input.visibility !== 'published') return 'Only published apps can be featured on the public App Store.';
  if (input.lifecycle === 'live' && !input.iconUrl?.trim()) return 'A live app needs an app icon URL.';
  if (input.artifactByteSize !== null && input.artifactByteSize !== undefined && (!Number.isSafeInteger(input.artifactByteSize) || input.artifactByteSize <= 0)) return 'Artifact byte size must be a positive whole number.';
  if (input.artifactBuild !== null && input.artifactBuild !== undefined && (!Number.isSafeInteger(input.artifactBuild) || input.artifactBuild <= 0)) return 'Artifact build must be a positive whole number.';
  if (input.downloadLink && /\.apk(?:$|[?#])/i.test(input.downloadLink)) { const versions: string[] = input.downloadLink.match(/\d+\.\d+(?:\.\d+)?/g) || []; if (versions.length > 0 && !versions.includes(input.version.replace(/^v/i, ''))) return 'The APK URL version must match the displayed release version.'; }
  return null;
}

export async function listApps(includeDrafts = true) {
  const client = ensureServer();
  let query = client.from('apps').select('*').order('sort_order').order('updated_at', { ascending: false });
  if (!includeDrafts) query = query.eq('visibility', 'published');
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((item) => mapApp(item));
}

export async function getPublishedAppBySlug(slug: string) {
  const { data, error } = await ensureServer().from('apps').select('*').eq('visibility', 'published').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data ? mapApp(data) : null;
}

export async function createApp(input: AppInput) {
  const { data, error } = await ensureServer().from('apps').insert(row(input)).select('*').single();
  if (error) throw error;
  return mapApp(data);
}

export async function updateApp(id: string, input: AppInput) {
  const { data, error } = await ensureServer().from('apps').update(row(input)).eq('id', id).select('*').single();
  if (error) throw error;
  return mapApp(data);
}

export async function deleteApp(id: string) {
  const { error } = await ensureServer().from('apps').delete().eq('id', id);
  if (error) throw error;
}
