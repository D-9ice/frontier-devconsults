import type { AppRecord } from '@/lib/apps';
import {
  availabilityLabel,
  canonicalAppName,
  compactSummary,
  isCommercialProduct,
  isWebsiteSolution,
  lifecycleLabel,
  developmentStatusLabel,
  commercialModeLabels,
  isAcquisitionEnabled,
  primaryCta,
  releaseArtifactReady,
  solutionKindLabel,
  type AppPrimaryCta,
} from '@/lib/application-presentation';

export type PublicAppCard = {
  id: string;
  name: string;
  slug: string | null;
  category: string;
  summary: string;
  features: string[];
  technologies: string[];
  solutionKind: AppRecord['solutionKind'];
  solutionKindLabel: string;
  lifecycle: AppRecord['lifecycle'];
  lifecycleLabel: string;
  availability: AppRecord['availability'];
  availabilityLabel: string;
  artworkUrl: string | null;
  cta: AppPrimaryCta;
  commercialByEnquiry: boolean;
  developmentStatusLabel: string;
  completionPercentage: number | null;
  commercialLabels: string[];
  acquisitionEnabled: boolean;
  tagline: string | null;
};

export type PublicAppDetail = PublicAppCard & {
  description: string;
  clientProblem: string | null;
  solutionSummary: string | null;
  responsibilities: string[];
  challenges: string[];
  outcomes: Array<{ label: string; value: string; evidenceNote?: string }>;
  confidentialityNote: string | null;
  commercialModes: string[];
  releaseReady: boolean;
  artifactVersion: string | null;
  artifactBuild: number | null;
  artifactFilename: string | null;
  artifactPlatform: string | null;
  artifactByteSize: number | null;
  artifactReleaseDate: string | null;
  artifactChecksum: string | null;
  showArtifactVerificationNotice: boolean;
  screenshotUrls: string[];
  roadmapItems: string[];
  technologyStack: Record<string, string[]>;
  supportSummary: string | null;
  deploymentOptions: string[];
  customizationAvailable: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
};

export function toPublicAppCard(app: AppRecord): PublicAppCard {
  return {
    id: app.id,
    name: canonicalAppName(app.name),
    slug: app.slug,
    category: app.category,
    summary: app.shortDescription || compactSummary(app.description),
    features: app.features.slice(0, 5),
    technologies: app.technologies.slice(0, 12),
    solutionKind: app.solutionKind,
    solutionKindLabel: solutionKindLabel(app.solutionKind),
    lifecycle: app.lifecycle,
    lifecycleLabel: lifecycleLabel(app.lifecycle),
    availability: app.availability,
    availabilityLabel: availabilityLabel(app.availability),
    artworkUrl: app.thumbnailUrl || app.iconUrl,
    cta: primaryCta(app),
    commercialByEnquiry: isCommercialProduct(app),
    developmentStatusLabel: developmentStatusLabel(app.developmentStatus, app.lifecycle),
    completionPercentage: app.completionPercentage,
    commercialLabels: app.commercialModes.map((mode) => commercialModeLabels[mode]),
    acquisitionEnabled: isAcquisitionEnabled(app),
    tagline: app.tagline,
  };
}

export function toPublicAppDetail(app: AppRecord): PublicAppDetail {
  const releaseReady = releaseArtifactReady(app);
  return {
    ...toPublicAppCard(app),
    features: app.features.slice(0, 12),
    technologies: app.technologies.slice(0, 16),
    description: app.description,
    clientProblem: app.clientProblem,
    solutionSummary: app.solutionSummary,
    responsibilities: app.responsibilities.slice(0, 12),
    challenges: app.challenges.slice(0, 12),
    outcomes: app.outcomes.slice(0, 8),
    confidentialityNote: app.confidentialityNote,
    commercialModes: app.commercialModes.slice(0, 3),
    releaseReady,
    artifactVersion: releaseReady ? app.artifactVersion : null,
    artifactBuild: releaseReady ? app.artifactBuild : null,
    artifactFilename: releaseReady ? app.artifactFilename : null,
    artifactPlatform: releaseReady ? app.artifactPlatform : null,
    artifactByteSize: releaseReady ? app.artifactByteSize : null,
    artifactReleaseDate: releaseReady ? app.artifactReleaseDate : null,
    artifactChecksum: releaseReady ? app.artifactChecksum : null,
    showArtifactVerificationNotice: !isWebsiteSolution(app) && app.artifactAvailability === 'temporarily_unavailable' && Boolean(app.downloadLink),
    screenshotUrls: app.screenshotUrls,
    roadmapItems: app.roadmapItems,
    technologyStack: app.technologyStack,
    supportSummary: app.supportSummary,
    deploymentOptions: app.deploymentOptions,
    customizationAvailable: app.customizationAvailable,
    seoTitle: app.seoTitle,
    seoDescription: app.seoDescription,
    ogImageUrl: app.ogImageUrl,
    cta: primaryCta(app, 'detail'),
  };
}
