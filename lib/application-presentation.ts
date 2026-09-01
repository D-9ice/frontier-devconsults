import type { AppRecord, Lifecycle, PrimaryAction } from '@/lib/apps';

export type AppPrimaryCta = { label: string; href: string; external: boolean; kind: Exclude<PrimaryAction, 'automatic' | 'none'> } | null;
export type CtaSurface = 'card' | 'detail';
export type DestinationKind = 'website' | 'artifact' | 'demo' | 'store_listing' | 'repository' | 'enquiry';
export type PublicDestination = { kind: DestinationKind; href: string; verified: boolean };

export function canonicalAppName(name: string) { return name.replace(/\bProCreator Pro\b/gi, 'Pro Creator Pro'); }
export function lifecycleLabel(value: Lifecycle) { return value === 'live' ? 'Live' : value === 'in_development' ? 'In Development' : value === 'archived' ? 'Archived' : 'Planning'; }
export function availabilityLabel(value: AppRecord['availability']) { return ({ available: 'Available', coming_soon: 'Coming Soon', by_enquiry: 'Available by Enquiry', unavailable: 'Unavailable' } as const)[value]; }
export function solutionKindLabel(value: AppRecord['solutionKind']) { return ({ mobile_application: 'Mobile Application', web_application: 'Web Application', website: 'Website', ai_platform: 'AI Platform', engineering_solution: 'Engineering Solution', engineering_service: 'Engineering Service', client_project: 'Client Project', other: 'Software Solution' } as const)[value]; }

export function primaryCta(app: AppRecord, surface: CtaSurface = 'card'): AppPrimaryCta {
  const detail = app.slug ? `/app-store/${encodeURIComponent(app.slug)}` : null;
  if (app.primaryAction === 'none' || app.lifecycle === 'archived' || app.availability === 'unavailable') return null;
  if (app.primaryAction === 'request_quote') return quotationCta(app);
  if (app.primaryAction === 'join_waitlist') return { ...quotationCta(app)!, label: 'Join the Waitlist', kind: 'join_waitlist' };
  if (app.primaryAction === 'view_details' && surface === 'card' && detail) return { label: 'View Details', href: detail, external: false, kind: 'view_details' };

  const destinations = publicDestinations(app);
  const website = destinations.find((item) => item.kind === 'website' && item.verified);
  const demo = destinations.find((item) => item.kind === 'demo' && item.verified);
  const listing = destinations.find((item) => item.kind === 'store_listing' && item.verified);
  const artifact = destinations.find((item) => item.kind === 'artifact' && item.verified);
  if (app.lifecycle === 'live' && website) return { label: 'Visit Live Website', href: website.href, external: true, kind: 'visit_live' };
  if (app.lifecycle === 'live' && demo) return { label: 'View Live Demo', href: demo.href, external: true, kind: 'request_demo' };
  if (app.lifecycle === 'live' && listing) return { label: 'View App Listing', href: listing.href, external: true, kind: 'visit_live' };
  if (artifact) return { label: 'Download Verified Release', href: artifact.href, external: true, kind: 'download' };
  if (app.availability === 'by_enquiry' || (app.availability === 'available' && surface === 'detail')) return quotationCta(app);
  if (surface === 'card' && detail) return { label: 'View Details', href: detail, external: false, kind: 'view_details' };
  return null;
}

function quotationCta(app: AppRecord): AppPrimaryCta {
  const subject = encodeURIComponent(`Quotation request: ${canonicalAppName(app.name)}`);
  return { label: 'Request a Quotation', href: `/contact?subject=${subject}#request-build`, external: false, kind: 'request_quote' };
}

function firstSafeUrl(...values: Array<string | null>) {
  for (const value of values) { if (!value) continue; try { const url = new URL(value); if (['http:', 'https:'].includes(url.protocol)) return url.toString(); } catch { /* Ignore invalid legacy URLs. */ } }
  return null;
}

export function isVerifiedExternalDestination(app: AppRecord) { return Boolean(app.externalUrlVerifiedAt && !Number.isNaN(Date.parse(app.externalUrlVerifiedAt))); }
export function isWebsiteSolution(app: Pick<AppRecord, 'solutionKind'>) { return ['website', 'web_application', 'client_project', 'engineering_service'].includes(app.solutionKind); }
export function publicDestinations(app: AppRecord): PublicDestination[] {
  const destinations: PublicDestination[] = [];
  const externallyVerified = isVerifiedExternalDestination(app);
  if (isWebsiteSolution(app)) {
    const website = firstSafeUrl(app.demoUrl, app.downloadLink);
    if (website) destinations.push({ kind: 'website', href: website, verified: externallyVerified });
  } else {
    const demo = firstSafeUrl(app.demoUrl);
    if (demo) destinations.push({ kind: 'demo', href: demo, verified: externallyVerified });
    const listing = firstSafeUrl(app.playStoreLink);
    if (listing) destinations.push({ kind: 'store_listing', href: listing, verified: externallyVerified });
    if (releaseArtifactReady(app)) destinations.push({ kind: 'artifact', href: app.downloadLink!, verified: true });
  }
  return destinations;
}

export function formatUsdMinor(amount: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: amount % 100 === 0 ? 0 : 2 }).format(amount / 100); }
export function isCommercialProduct(app: AppRecord) { return app.showInProducts && app.commercialModes.length > 0 && app.availability !== 'unavailable'; }
export function compactSummary(text: string, max = 220) { const normalized = text.replace(/\s+/g, ' ').trim(); if (normalized.length <= max) return normalized; const cut = normalized.slice(0, max + 1).lastIndexOf(' '); return `${normalized.slice(0, cut > 120 ? cut : max).trim()}…`; }
export function releaseArtifactReady(app: AppRecord) {
  if (isWebsiteSolution(app)) return false;
  if (app.artifactAvailability !== 'available' || !app.downloadLink || !app.artifactVersion || !app.artifactPlatform || !app.artifactByteSize || !app.artifactReleaseDate || !app.artifactChecksum || !app.artifactVerifiedAt) return false;
  if (Number.isNaN(Date.parse(app.artifactReleaseDate)) || Number.isNaN(Date.parse(app.artifactVerifiedAt))) return false;
  return app.artifactVersion.replace(/^v/i, '') === app.version.replace(/^v/i, '');
}
export const releaseMetadataMatches = releaseArtifactReady;
