import type { AppRecord } from '@/lib/apps';
import { canonicalAppName, compactSummary, lifecycleLabel, solutionKindLabel } from '@/lib/application-presentation';

const prohibited = /(?:mailto:|tel:|wa\.me|whatsapp|telegram|linkedin|facebook|instagram|twitter|x\.com|github\.com|gitlab\.com|bitbucket|\bpassword\b|\bpaypal\b|\bmobile\s*money\b|\bpay\s+(?:me|us|directly)\b|https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?\d[\d\s().-]{7,}\d))/i;
function safeText(value: string | null | undefined) { const text = value?.replace(/\s+/g, ' ').trim(); return text && !prohibited.test(text) ? text : null; }
function safeList(values: string[], limit: number) { return values.map(safeText).filter((value): value is string => Boolean(value)).slice(0, limit); }

export type UpworkSafeProject = {
  slug: string; name: string; category: string; kind: string; lifecycle: string; deliveryStatus: string; summary: string;
  problem: string | null; role: string[]; features: string[]; technologies: string[]; skillTags: string[]; relevance: string | null;
  outcomes: Array<{ label: string; value: string; evidenceNote: string }>; artwork: string[];
};

export function toUpworkSafeProject(app: AppRecord): UpworkSafeProject | null {
  if (app.visibility !== 'published' || !app.showInUpworkPortfolio || !app.slug) return null;
  const name = safeText(canonicalAppName(app.name)); const summary = safeText(compactSummary(app.solutionSummary || app.description, 420));
  if (!name || !summary) return null;
  const outcomes = app.outcomes.map((item) => ({ label: safeText(item.label), value: safeText(item.value), evidenceNote: safeText(item.evidenceNote) })).filter((item): item is { label: string; value: string; evidenceNote: string } => Boolean(item.label && item.value && item.evidenceNote)).slice(0, 6);
  const storageHost = 'dfvrmaiqiyhtturtxykf.supabase.co';
  return { slug: app.slug, name, category: safeText(app.category) || 'Engineering and software', kind: solutionKindLabel(app.solutionKind), lifecycle: lifecycleLabel(app.lifecycle), deliveryStatus: app.availability === 'unavailable' ? 'Unavailable' : app.availability === 'coming_soon' ? 'Coming soon' : 'Portfolio evidence', summary, problem: safeText(app.clientProblem), role: safeList(app.responsibilities, 8), features: safeList(app.features, 8), technologies: safeList(app.technologies, 12), skillTags: safeList(app.upworkSkillTags, 12), relevance: safeText(app.upworkRelevance), outcomes, artwork: [app.thumbnailUrl, app.iconUrl, ...app.screenshotUrls].filter((value): value is string => Boolean(value)).filter((value) => { try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === storageHost && url.pathname.startsWith('/storage/v1/object/public/app-media/'); } catch { return false; } }).slice(0, 5) };
}

export function approvedUpworkUrl(value = process.env.UPWORK_PROFILE_URL) {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === 'https:' && (url.hostname === 'upwork.com' || url.hostname === 'www.upwork.com') ? url.toString() : null; } catch { return null; }
}
