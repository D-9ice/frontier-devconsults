import type { AppRecord } from '@/lib/apps';
import { canonicalAppName, compactSummary, lifecycleLabel, solutionKindLabel } from '@/lib/application-presentation';

export type UpworkSafeProject = { slug: string; name: string; category: string; kind: string; lifecycle: string; summary: string; features: string[]; technologies: string[]; responsibilities: string[]; iconUrl: string | null };
export function toUpworkSafeProject(app: AppRecord): UpworkSafeProject | null {
  if (app.visibility !== 'published' || !app.showInUpworkPortfolio || !app.slug) return null;
  return { slug: app.slug, name: canonicalAppName(app.name), category: app.category, kind: solutionKindLabel(app.solutionKind), lifecycle: lifecycleLabel(app.status), summary: compactSummary(app.solutionSummary || app.description, 420), features: app.features.slice(0, 8), technologies: app.technologies.slice(0, 12), responsibilities: app.responsibilities.slice(0, 8), iconUrl: app.iconUrl };
}
export function approvedUpworkUrl(value = process.env.UPWORK_PROFILE_URL) {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === 'https:' && (url.hostname === 'upwork.com' || url.hostname === 'www.upwork.com') ? url.toString() : null; } catch { return null; }
}
