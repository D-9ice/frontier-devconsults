import type { AppRecord, AppStatus, PrimaryAction } from '@/lib/apps';

export type AppPrimaryCta = { label: string; href: string; external: boolean; kind: Exclude<PrimaryAction, 'automatic' | 'none'> } | null;

export function canonicalAppName(name: string) { return name.replace(/\bProCreator Pro\b/gi, 'Pro Creator Pro'); }
export function lifecycleLabel(status: AppStatus) { return status === 'Published' ? 'Live' : status === 'Development' ? 'In Development' : 'Planning'; }
export function availabilityLabel(value: AppRecord['availability']) { return ({ available: 'Available', coming_soon: 'Coming Soon', by_enquiry: 'Available by Enquiry', unavailable: 'Unavailable' } as const)[value]; }
export function solutionKindLabel(value: AppRecord['solutionKind']) { return ({ mobile_application: 'Mobile Application', web_application: 'Web Application', website: 'Website', ai_platform: 'AI Platform', engineering_solution: 'Engineering Solution', engineering_service: 'Engineering Service', client_project: 'Client Project', other: 'Software Solution' } as const)[value]; }

export function primaryCta(app: AppRecord): AppPrimaryCta {
  const detail = app.slug ? `/app-store/${encodeURIComponent(app.slug)}` : null;
  const websiteLike = ['website', 'web_application', 'client_project', 'engineering_service'].includes(app.solutionKind);
  const selected = app.primaryAction;
  if (selected === 'none') return null;
  if (selected === 'download' && app.downloadLink && releaseMetadataMatches(app)) return { label: 'Download App', href: app.downloadLink, external: true, kind: 'download' };
  if (selected === 'visit_live' && (app.playStoreLink || app.downloadLink)) return { label: 'Visit Live Website', href: app.playStoreLink || app.downloadLink!, external: true, kind: 'visit_live' };
  if (selected === 'view_details' && detail) return { label: 'View Details', href: detail, external: false, kind: 'view_details' };
  if (selected === 'request_demo') return { label: 'Request a Demonstration', href: app.demoUrl || `/contact?subject=${encodeURIComponent(`Demo request: ${canonicalAppName(app.name)}`)}`, external: Boolean(app.demoUrl), kind: 'request_demo' };
  if (selected === 'request_quote') return { label: 'Request a Quote', href: `/contact?subject=${encodeURIComponent(`Quote request: ${canonicalAppName(app.name)}`)}`, external: false, kind: 'request_quote' };
  if (selected === 'join_waitlist') return detail ? { label: 'View Coming Soon Details', href: detail, external: false, kind: 'join_waitlist' } : null;
  if (app.status === 'Published' && app.downloadLink && !websiteLike && releaseMetadataMatches(app)) return { label: 'Download App', href: app.downloadLink, external: true, kind: 'download' };
  if (app.playStoreLink) return { label: websiteLike ? 'Visit Live Website' : 'View on Google Play', href: app.playStoreLink, external: true, kind: 'visit_live' };
  if (websiteLike && app.downloadLink) return { label: 'Visit Live Website', href: app.downloadLink, external: true, kind: 'visit_live' };
  if (detail) return { label: 'View Details', href: detail, external: false, kind: 'view_details' };
  if (app.demoUrl) return { label: 'Request a Demonstration', href: app.demoUrl, external: true, kind: 'request_demo' };
  return null;
}

export function formatUsdMinor(amount: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: amount % 100 === 0 ? 0 : 2 }).format(amount / 100); }
export function isCommercialProduct(app: AppRecord) { return app.showInProducts && app.commercialModes.length > 0 && app.availability !== 'unavailable'; }
export function compactSummary(text: string, max = 220) { const normalized = text.replace(/\s+/g, ' ').trim(); if (normalized.length <= max) return normalized; const cut = normalized.slice(0, max + 1).lastIndexOf(' '); return `${normalized.slice(0, cut > 120 ? cut : max).trim()}…`; }
export function releaseMetadataMatches(app: AppRecord) { if (!app.downloadLink || !/\.apk(?:$|[?#])/i.test(app.downloadLink)) return true; const versions: string[] = app.downloadLink.match(/\d+\.\d+(?:\.\d+)?/g) || []; return versions.length === 0 || versions.includes(app.version.replace(/^v/i, '')); }
